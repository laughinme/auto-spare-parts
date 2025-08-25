from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables.models.models_table import Model


class ModelsSeeder(BaseSeeder):
    """Seeder for loading vehicle models from vPIC JSON file"""
    
    async def seed(self) -> None:
        """Load vehicle models into the database"""
        
        # Check if data already exists
        existing_count = await self.get_record_count(Model)
        if existing_count > 0:
            self.log_progress(f"Table already has {existing_count} models, skipping...")
            return
        
        # Load data from JSON
        self.log_progress("Loading models from JSON...")
        models_data = await self.load_json_data("models.json")
        
        if not models_data:
            self.log_progress("No models data found in JSON file")
            return
        
        # Prepare data for insertion
        models_to_insert = []
        for item in models_data:
            model_data = {
                "make_id": item.get("make_id"),
                "model_name": item.get("model_name", "").strip()
            }
            
            # Check required fields
            if model_data["make_id"] and model_data["model_name"]:
                models_to_insert.append(model_data)
        
        if not models_to_insert:
            self.log_progress("No valid models to insert")
            return
        
        # Remove duplicates by make_id + model_name
        unique_models = []
        seen = set()
        for model in models_to_insert:
            key = (model["make_id"], model["model_name"])
            if key not in seen:
                seen.add(key)
                unique_models.append(model)
        
        # Process in batches
        batch_size = 2000
        total_batches = (len(unique_models) + batch_size - 1) // batch_size
        
        for i in range(total_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(unique_models))
            batch = unique_models[start_idx:end_idx]
            
            self.log_progress(f"Inserting batch {i+1}/{total_batches} ({len(batch)} models)")
            
            # Bulk insert with ON CONFLICT DO UPDATE for PostgreSQL
            stmt = insert(Model).values(batch)
            await self.session.execute(stmt)
        
        await self.commit()
        
        self.log_progress(f"Successfully seeded {len(unique_models)} unique models")
