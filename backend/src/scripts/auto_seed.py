import asyncio
import sys
import os
import logging
from pathlib import Path

backend_dir = Path(__file__).parent.parent
src_dir = backend_dir
sys.path.insert(0, str(src_dir))

from download_vpic_data import VPICDownloader
from database.seeders.run_all_seeders import SeedRunner

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AutoSeeder:
    """Automated seeding with data download support"""
    
    def __init__(self):
        self.scripts_dir = Path(__file__).parent.parent.parent
        self.data_dir = src_dir / "database" / "seeders" / "data"
        self.required_files = [
            "manufacturers.json",
            "makes.json", 
            "manufacturer_makes.json",
            "vehicle_types.json",
            "models.json",
            "model_years.json"
        ]
        
        self.force_seed = os.getenv("FORCE_SEED", "false").lower() == "true"
        self.skip_download = os.getenv("SKIP_DATA_DOWNLOAD", "false").lower() == "true"
        self.skip_auto_seed = os.getenv("SKIP_AUTO_SEED", "false").lower() == "true"
    
    def check_data_files_exist(self) -> bool:
        """Check if all required JSON data files exist"""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        missing_files = []
        for filename in self.required_files:
            filepath = self.data_dir / filename
            logger.info(f"Checking if {filepath} exists")
            if not filepath.exists() or filepath.stat().st_size == 0:
                missing_files.append(filename)
        
        if missing_files:
            logger.warning(f"Missing or empty data files: {missing_files}")
            return False
        
        logger.info(f"All required data files exist in {self.data_dir}")
        return True
    
    async def download_data_if_needed(self) -> bool:
        """Download data from vPIC API if files don't exist"""
        if self.skip_download:
            logger.info("Skipping data download (SKIP_DATA_DOWNLOAD=true)")
            return self.check_data_files_exist()
            
        if self.check_data_files_exist():
            logger.info("Data files already exist, skipping download")
            return True
        
        logger.info("Downloading data from vPIC API...")
        try:
            downloader = VPICDownloader()
            await downloader.download_all_data()
            
            # Verify download was successful
            if self.check_data_files_exist():
                logger.info("Data download completed successfully")
                return True
            else:
                logger.error("Data download failed - not all files created")
                return False
                
        except Exception as e:
            logger.error(f"Error downloading data: {e}")
            return False
    
    async def run_seeding(self) -> bool:
        """Run database seeding"""
        logger.info("Starting database seeding...")
        if self.force_seed:
            logger.warning("Force mode enabled (FORCE_SEED=true)")
            
        try:
            runner = SeedRunner()
            await runner.run_all_seeders(force=self.force_seed)
            logger.info("Database seeding completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error during seeding: {e}")
            return False
    
    async def auto_seed(self) -> bool:
        """Main auto-seeding process"""
        if self.skip_auto_seed:
            logger.info("Skipping auto-seeding (SKIP_AUTO_SEED=true)")
            return True
            
        logger.info("Starting auto-seeding process...")
        
        # Step 1: Download data if needed
        if not await self.download_data_if_needed():
            logger.error("Failed to ensure data files exist")
            return False
        
        # Step 2: Run seeding
        if not await self.run_seeding():
            logger.error("Failed to seed database")
            return False
        
        logger.info("Auto-seeding completed successfully!")
        return True


async def main():
    """Main function"""
    auto_seeder = AutoSeeder()
    
    try:
        success = await auto_seeder.auto_seed()
        if not success:
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.warning("Auto-seeding interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
