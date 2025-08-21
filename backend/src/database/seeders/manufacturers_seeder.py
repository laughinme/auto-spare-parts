from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db import Manufacturer


class ManufacturersSeeder(BaseSeeder):
    
    async def seed(self) -> None:
        existing_count = await self.get_record_count(Manufacturer)
        if existing_count > 0 and not self.force:
            self.log_progress(f"Table already has {existing_count} manufacturers, skipping...")
            return
        
        self.log_progress("Loading manufacturers from JSON...")
        manufacturers_data = await self.load_json_data("manufacturers.json")
        
        if not manufacturers_data and not self.force:
            self.log_progress("No manufacturers data found in JSON file")
            return
        
        if self.force:
            self.log_progress("Deleting existing manufacturers...")
            await self.session.execute(delete(Manufacturer))
        
        manufacturers_to_insert = []
        for item in manufacturers_data:
            manufacturer_data = {
                "manufacturer_id": item.get("Mfr_ID"),
                "name": item.get("Mfr_Name", "").strip(),
                "mfr_common_name": item.get("Mfr_CommonName", "").strip() if item.get("Mfr_CommonName") else None,
                "country": item.get("Country", "").strip() if item.get("Country") else None,
                "status": None,  # Not available in base API
                "type": None     # Not available in base API
            }
            
            if manufacturer_data["manufacturer_id"] and manufacturer_data["name"]:
                manufacturers_to_insert.append(manufacturer_data)
        
        if not manufacturers_to_insert:
            self.log_progress("No valid manufacturers to insert")
            return
        
        batch_size = 2000
        total_batches = (len(manufacturers_to_insert) + batch_size - 1) // batch_size
        
        for i in range(total_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(manufacturers_to_insert))
            batch = manufacturers_to_insert[start_idx:end_idx]
            
            self.log_progress(f"Inserting batch {i+1}/{total_batches} ({len(batch)} manufacturers)")
            
            # Bulk insert with ON CONFLICT DO UPDATE for PostgreSQL
            stmt = insert(Manufacturer).values(batch)
            stmt = stmt.on_conflict_do_update(
                index_elements=['manufacturer_id'],
                set_={
                    'name': stmt.excluded.name,
                    'mfr_common_name': stmt.excluded.mfr_common_name,
                    'country': stmt.excluded.country,
                    'updated_at': stmt.excluded.updated_at
                }
            )
            await self.session.execute(stmt)
        
        await self.commit()
        
        self.log_progress(f"Successfully seeded {len(manufacturers_to_insert)} manufacturers")
