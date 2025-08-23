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
        
        # Bulk insert with ON CONFLICT DO NOTHING for PostgreSQL
        stmt = insert(Model).values(unique_models)
        stmt = stmt.on_conflict_do_nothing()
        
        await self.session.execute(stmt)
        await self.commit()
        
        self.log_progress(f"Successfully seeded {len(unique_models)} unique models")
