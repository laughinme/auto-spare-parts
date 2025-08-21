#!/usr/bin/env python3
"""
Auto-seeding script for production deployment.
Downloads data from vPIC API if needed and runs database seeding.
Only seeds if tables are empty.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add src to path for imports
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from download_vpic_data import VPICDownloader
from database.seeders.run_all_seeders import SeedRunner


class AutoSeeder:
    """Automated seeding with data download support"""
    
    def __init__(self):
        self.scripts_dir = Path(__file__).parent
        self.data_dir = src_dir / "database" / "seeders" / "data"
        self.required_files = [
            "manufacturers.json",
            "makes.json", 
            "manufacturer_makes.json",
            "vehicle_types.json",
            "models.json",
            "model_years.json"
        ]
        
        # Environment variables for configuration
        self.force_seed = os.getenv("FORCE_SEED", "false").lower() == "true"
        self.skip_download = os.getenv("SKIP_DATA_DOWNLOAD", "false").lower() == "true"
        self.skip_auto_seed = os.getenv("SKIP_AUTO_SEED", "false").lower() == "true"
    
    def check_data_files_exist(self) -> bool:
        """Check if all required JSON data files exist"""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        missing_files = []
        for filename in self.required_files:
            filepath = self.data_dir / filename
            if not filepath.exists() or filepath.stat().st_size == 0:
                missing_files.append(filename)
        
        if missing_files:
            print(f"📋 Missing or empty data files: {missing_files}")
            return False
        
        print(f"✅ All required data files exist in {self.data_dir}")
        return True
    
    async def download_data_if_needed(self) -> bool:
        """Download data from vPIC API if files don't exist"""
        if self.skip_download:
            print("⏭️  Skipping data download (SKIP_DATA_DOWNLOAD=true)")
            return self.check_data_files_exist()
            
        if self.check_data_files_exist():
            print("📂 Data files already exist, skipping download")
            return True
        
        print("📥 Downloading data from vPIC API...")
        try:
            downloader = VPICDownloader()
            await downloader.download_all_data()
            
            # Verify download was successful
            if self.check_data_files_exist():
                print("✅ Data download completed successfully")
                return True
            else:
                print("❌ Data download failed - not all files created")
                return False
                
        except Exception as e:
            print(f"❌ Error downloading data: {e}")
            return False
    
    async def run_seeding(self) -> bool:
        """Run database seeding"""
        print("🌱 Starting database seeding...")
        if self.force_seed:
            print("⚠️  Force mode enabled (FORCE_SEED=true)")
            
        try:
            runner = SeedRunner()
            await runner.run_all_seeders(force=self.force_seed)
            print("✅ Database seeding completed successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            return False
    
    async def auto_seed(self) -> bool:
        """Main auto-seeding process"""
        if self.skip_auto_seed:
            print("⏭️  Skipping auto-seeding (SKIP_AUTO_SEED=true)")
            return True
            
        print("🚀 Starting auto-seeding process...")
        
        # Step 1: Download data if needed
        if not await self.download_data_if_needed():
            print("❌ Failed to ensure data files exist")
            return False
        
        # Step 2: Run seeding
        if not await self.run_seeding():
            print("❌ Failed to seed database")
            return False
        
        print("🎉 Auto-seeding completed successfully!")
        return True


async def main():
    """Main function"""
    auto_seeder = AutoSeeder()
    
    try:
        success = await auto_seeder.auto_seed()
        if not success:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Auto-seeding interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
