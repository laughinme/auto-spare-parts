from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables.manufacturers.manufacturer_make_table import ManufacturerMake


class ManufacturerMakesSeeder(BaseSeeder):
    """Seeder for loading manufacturer-make relations from vPIC JSON file"""
    
    async def seed(self) -> None:
        """Load manufacturer-make relations into the database"""
        
        # Check if data already exists
        existing_count = await self.get_record_count(ManufacturerMake)
        if existing_count > 0 and not self.force:
            self.log_progress(f"Table already has {existing_count} manufacturer-make relations, skipping...")
            return
        
        # Load data from JSON
        self.log_progress("Loading manufacturer-make mappings from JSON...")
        mappings_data = await self.load_json_data("manufacturer_makes.json")
        
        if not mappings_data and not self.force:
            self.log_progress("No manufacturer-make mappings data found in JSON file")
            return
        
        if self.force:
            self.log_progress("Deleting existing manufacturer-make relations...")
            await self.session.execute(delete(ManufacturerMake))
        
        # Prepare data for insertion
        mappings_to_insert = []
        for item in mappings_data:
            mapping_data = {
                "manufacturer_id": item.get("manufacturer_id"),
                "make_id": item.get("make_id")
            }
            
            # Check required fields
            if mapping_data["manufacturer_id"] and mapping_data["make_id"]:
                mappings_to_insert.append(mapping_data)
        
        if not mappings_to_insert:
            self.log_progress("No valid manufacturer-make mappings to insert")
            return
        
        # Remove duplicates
        unique_mappings = []
        seen = set()
        for mapping in mappings_to_insert:
            key = (mapping["manufacturer_id"], mapping["make_id"])
            if key not in seen:
                seen.add(key)
                unique_mappings.append(mapping)
        
        batch_size = 2000
        total_batches = (len(unique_mappings) + batch_size - 1) // batch_size
        
        for i in range(total_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(unique_mappings))
            batch = unique_mappings[start_idx:end_idx]
            
            self.log_progress(f"Inserting batch {i+1}/{total_batches} ({len(batch)} manufacturer-make relations)")
            
            # Bulk insert with ON CONFLICT DO NOTHING for PostgreSQL
            stmt = insert(ManufacturerMake).values(batch)
            stmt = stmt.on_conflict_do_nothing(
                index_elements=['manufacturer_id', 'make_id']
            )
            await self.session.execute(stmt)
        
        await self.commit()
        
        self.log_progress(f"Successfully seeded {len(unique_mappings)} unique manufacturer-make relations")
