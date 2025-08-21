from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables import VehicleType


class VehicleTypesSeeder(BaseSeeder):
    """Seeder for loading vehicle types from vPIC JSON file"""
    
    async def seed(self) -> None:
        """Load vehicle types into the database"""
        
        # Check if data already exists
        existing_count = await self.get_record_count(VehicleType)
        if existing_count > 0:
            self.log_progress(f"Table already has {existing_count} vehicle types, skipping...")
            return
        
        # Load data from JSON
        self.log_progress("Loading vehicle types from JSON...")
        vehicle_types_data = await self.load_json_data("vehicle_types.json")
        
        if not vehicle_types_data:
            self.log_progress("No vehicle types data found in JSON file")
            return
        
        # Prepare data for insertion
        vehicle_types_to_insert = []
        for item in vehicle_types_data:
            vehicle_type_data = {
                "name": item.get("name", "").strip()
            }
            
            # Check required fields
            if vehicle_type_data["name"]:
                vehicle_types_to_insert.append(vehicle_type_data)
        
        if not vehicle_types_to_insert:
            self.log_progress("No valid vehicle types to insert")
            return
        
        unique_types = []
        seen_names = set()
        for vtype in vehicle_types_to_insert:
            name = vtype["name"]
            if name not in seen_names:
                seen_names.add(name)
                unique_types.append(vtype)
        
        # Bulk insert with ON CONFLICT DO NOTHING for PostgreSQL
        stmt = insert(VehicleType).values(unique_types)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=['name']
        )
        
        await self.session.execute(stmt)
        await self.commit()
        
        self.log_progress(f"Successfully seeded {len(unique_types)} unique vehicle types")
