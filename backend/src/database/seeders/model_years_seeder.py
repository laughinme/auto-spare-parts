from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables.models.model_years_table import ModelYear
from ..relational_db.tables.models.models_table import Model


class ModelYearsSeeder(BaseSeeder):
    """Seeder for loading model years from vPIC JSON file"""
    
    async def seed(self) -> None:
        """Load model years into the database"""
        
        # Check if data already exists
        existing_count = await self.get_record_count(ModelYear)
        if existing_count > 0:
            self.log_progress(f"Table already has {existing_count} model years, skipping...")
            return

        # Load data from JSON
        self.log_progress("Loading model years from JSON...")
        model_years_data = await self.load_json_data("model_years.json")

        if not model_years_data:
            self.log_progress("No model years data found in JSON file")
            return

        # Get model_name -> model_id mapping from database
        self.log_progress("Fetching models from database...")
        models_result = await self.session.execute(
            select(Model.model_id, Model.model_name, Model.make_id)
        )
        models_map = {}
        for model_id, model_name, make_id in models_result:
            key = (make_id, model_name)
            models_map[key] = model_id

        # Prepare data for insertion
        model_years_to_insert = []
        not_found_count = 0

        for item in model_years_data:
            make_id = item.get("make_id")
            model_name = item.get("model_name", "").strip()
            year = item.get("year")

            # Check required fields
            if not (make_id and model_name and year):
                continue

            # Find model_id in database
            key = (make_id, model_name)
            model_id = models_map.get(key)

            if not model_id:
                not_found_count += 1
                continue

            model_year_data = {
                "model_id": model_id,
                "year": year,
                "vehicle_type_id": None
            }

            model_years_to_insert.append(model_year_data)

        if not_found_count > 0:
            self.log_progress(f"Warning: {not_found_count} model years skipped (model not found in DB)")

        if not model_years_to_insert:
            self.log_progress("No valid model years to insert")
            return

        # Remove duplicates by model_id + year
        unique_model_years = []
        seen = set()
        for my in model_years_to_insert:
            key = (my["model_id"], my["year"])
            if key not in seen:
                seen.add(key)
                unique_model_years.append(my)

        # Process in batches
        batch_size = 2000
        total_batches = (len(unique_model_years) + batch_size - 1) // batch_size

        for i in range(total_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(unique_model_years))
            batch = unique_model_years[start_idx:end_idx]

            self.log_progress(f"Inserting batch {i+1}/{total_batches} ({len(batch)} model years)")

            # Bulk insert with ON CONFLICT DO NOTHING for PostgreSQL
            stmt = insert(ModelYear).values(batch)
            stmt = stmt.on_conflict_do_nothing(
                index_elements=['model_id', 'year']
            )
            await self.session.execute(stmt)

        await self.commit()

        self.log_progress(f"Successfully seeded {len(unique_model_years)} unique model years")
