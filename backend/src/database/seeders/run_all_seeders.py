import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from database.relational_db import get_uow
from .manufacturers_seeder import ManufacturersSeeder
from .makes_seeder import MakesSeeder
from .manufacturer_makes_seeder import ManufacturerMakesSeeder
from .vehicle_types_seeder import VehicleTypesSeeder
from .models_seeder import ModelsSeeder
from .model_years_seeder import ModelYearsSeeder


class SeedRunner:
    """Class for managing database seeder execution"""
    
    async def run_all_seeders(self, force: bool = False):
        """Run all seeders in the correct order"""
        print("🌱 Starting database seeding...")
        
        if force:
            print("⚠️  FORCE mode enabled - existing data may be updated")
        
        seeders_config = [
            ("Manufacturers", ManufacturersSeeder),
            ("Makes", MakesSeeder),
            ("Manufacturer-Make Relations", ManufacturerMakesSeeder),
            ("Vehicle Types", VehicleTypesSeeder),
            ("Models", ModelsSeeder),
            ("Model Years", ModelYearsSeeder),
        ]
        
        async for uow in get_uow():
            try:
                for seeder_name, seeder_class in seeders_config:
                    print(f"\n📦 Running {seeder_name} seeder...")
                    
                    seeder = seeder_class(uow, force=force)
                    await seeder.seed()
                    
                    print(f"✅ {seeder_name} seeder completed")
                
                print(f"\n🎉 All seeders completed successfully!")
                break
                
            except Exception as e:
                print(f"\n❌ Error during seeding: {e}")
                raise
    
    async def run_specific_seeder(self, seeder_name: str, force: bool = False):
        """Run a specific seeder"""
        seeders_map = {
            "manufacturers": ("Manufacturers", ManufacturersSeeder),
            "makes": ("Makes", MakesSeeder),
            "manufacturer_makes": ("Manufacturer-Make Relations", ManufacturerMakesSeeder),
            "vehicle_types": ("Vehicle Types", VehicleTypesSeeder),
            "models": ("Models", ModelsSeeder),
            "model_years": ("Model Years", ModelYearsSeeder),
        }
        
        if seeder_name not in seeders_map:
            available = ", ".join(seeders_map.keys())
            print(f"❌ Unknown seeder '{seeder_name}'. Available: {available}")
            return
        
        display_name, seeder_class = seeders_map[seeder_name]
        
        print(f"🌱 Running {display_name} seeder...")
        
        async for uow in get_uow():
            try:
                seeder = seeder_class(uow, force=force)
                await seeder.seed()
                print(f"✅ {display_name} seeder completed")
                break
                
            except Exception as e:
                print(f"❌ Error during seeding: {e}")
                raise

async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run database seeders")
    parser.add_argument(
        "--seeder",
        help="Run specific seeder (manufacturers, makes, manufacturer_makes, vehicle_types, models, model_years)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force update existing data"
    )
    
    args = parser.parse_args()
    
    runner = SeedRunner()
    
    try:
        if args.seeder:
            await runner.run_specific_seeder(args.seeder, force=args.force)
        else:
            await runner.run_all_seeders(force=args.force)
    
    except KeyboardInterrupt:
        print("\n⚠️  Seeding interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
