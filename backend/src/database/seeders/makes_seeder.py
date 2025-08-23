from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables.makes.makes_table import Make


class MakesSeeder(BaseSeeder):
    """Seeder for loading makes/brands from vPIC JSON file"""
    
    async def seed(self) -> None:
        """Load makes into database"""
        
        # Check if data already exists
        existing_count = await self.get_record_count(Make)
        if existing_count > 0 and not self.force:
            self.log_progress(f"Table already has {existing_count} makes, skipping...")
            return
        
        # Load data from JSON
        self.log_progress("Loading makes from JSON...")
        makes_data = await self.load_json_data("makes.json")
        
        if not makes_data and not self.force:
            self.log_progress("No makes data found in JSON file")
            return
        
        if self.force:
            self.log_progress("Deleting existing makes...")
            await self.session.execute(delete(Make))
        
        # Prepare data for insertion
        makes_to_insert = []
        for item in makes_data:
            make_data = {
                "make_id": item.get("Make_ID"),
                "make_name": item.get("Make_Name", "").strip()
            }
            
            # Check required fields
            if make_data["make_id"] and make_data["make_name"]:
                makes_to_insert.append(make_data)
        
        if not makes_to_insert:
            self.log_progress("No valid makes to insert")
            return
        
        # Process in batches
        batch_size = 2000
        total_batches = (len(makes_to_insert) + batch_size - 1) // batch_size
        
        for i in range(total_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(makes_to_insert))
            batch = makes_to_insert[start_idx:end_idx]
            
            self.log_progress(f"Inserting batch {i+1}/{total_batches} ({len(batch)} makes)")
            
            # Bulk insert with ON CONFLICT DO UPDATE for PostgreSQL
            stmt = insert(Make).values(batch)
            stmt = stmt.on_conflict_do_update(
                index_elements=['make_id'],
                set_={
                    'make_name': stmt.excluded.make_name,
                    'updated_at': stmt.excluded.updated_at
                }
            )
            await self.session.execute(stmt)
        
        await self.commit()
        
        self.log_progress(f"Successfully seeded {len(makes_to_insert)} makes")
