import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import select, func

from database.relational_db import (
    get_uow,
    Manufacturer,
    Make,
    ManufacturerMake,
    VehicleType,
    Model,
    ModelYear,
    Language,
    Role,
    User,
    Organization,
    OrgMembership,
    Product,
    ProductMedia,
    Cart,
    CartItem,
    Order,
    OrderItem,
    ProductReview,
    SellerReview,
    GarageVehicle,
    UserRole,
)
from .manufacturers_seeder import ManufacturersSeeder
from .makes_seeder import MakesSeeder
from .manufacturer_makes_seeder import ManufacturerMakesSeeder
from .vehicle_types_seeder import VehicleTypesSeeder
from .models_seeder import ModelsSeeder
from .model_years_seeder import ModelYearsSeeder
from .languages_seeder import LanguagesSeeder
from .roles_seeder import RolesSeeder
from .marketplace_seeder import MarketplaceSeeder


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
            ("Languages", LanguagesSeeder),
            ("Roles", RolesSeeder),
            ("Marketplace", MarketplaceSeeder),
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
            "languages": ("Languages", LanguagesSeeder),
            "roles": ("Roles", RolesSeeder),
            "marketplace": ("Marketplace", MarketplaceSeeder),
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

    async def print_stats(self) -> None:
        tables = [
            ("manufacturers", Manufacturer),
            ("makes", Make),
            ("manufacturer_make", ManufacturerMake),
            ("vehicle_types", VehicleType),
            ("models", Model),
            ("model_years", ModelYear),
            ("languages", Language),
            ("roles", Role),
            ("users", User),
            ("organizations", Organization),
            ("org_memberships", OrgMembership),
            ("user_roles", UserRole),
            ("products", Product),
            ("product_media", ProductMedia),
            ("carts", Cart),
            ("cart_items", CartItem),
            ("orders", Order),
            ("order_items", OrderItem),
            ("product_reviews", ProductReview),
            ("seller_reviews", SellerReview),
            ("garage_vehicles", GarageVehicle),
        ]

        async for uow in get_uow():
            print("📊 Current table counts:")
            for label, table in tables:
                result = await uow.session.execute(select(func.count()).select_from(table))
                count = result.scalar() or 0
                print(f"  {label}: {count}")
            break

async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run database seeders")
    parser.add_argument(
        "--seeder",
        help="Run specific seeder (manufacturers, makes, manufacturer_makes, vehicle_types, models, model_years, languages, roles, marketplace)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force update existing data"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Print table counts and exit"
    )
    
    args = parser.parse_args()
    
    runner = SeedRunner()
    
    try:
        if args.stats:
            await runner.print_stats()
            return
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
