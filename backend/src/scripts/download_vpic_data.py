import asyncio
import httpx
import json
import time
import urllib.parse

from pathlib import Path
from typing import Any
from datetime import datetime


class VPICDownloader:
    """Class for downloading data from vPIC API"""
    
    def __init__(self):
        self.base_url = "https://vpic.nhtsa.dot.gov/api/vehicles"
        self.data_dir = Path(__file__).parent.parent / 'database' / 'seeders' / "data" 
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # API rate limiting
        self.delay_between_requests = 0.1  # 100ms between requests
        self.max_retries = 3
        
    async def make_request(self, client: httpx.AsyncClient, url: str, retries: int = 0) -> dict[str, Any] | None:
        """Make HTTP request with retry logic"""
        try:
            await asyncio.sleep(self.delay_between_requests)
            
            response = await client.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return data
            else:
                print(f"HTTP {response.status_code} for {url}")
                return None
                    
        except Exception as e:
            if retries < self.max_retries:
                print(f"Request failed ({e}), retrying {retries + 1}/{self.max_retries}: {url}")
                await asyncio.sleep(2 ** retries)  # Exponential backoff
                return await self.make_request(client, url, retries + 1)
            else:
                print(f"Request failed after {self.max_retries} retries: {url} - {e}")
                return None

    async def download_manufacturers_paginated(self, client: httpx.AsyncClient) -> list[dict[str, Any]]:
        """Download all manufacturers with pagination"""
        print("📥 Downloading manufacturers...")
        
        all_manufacturers = []
        page = 1
        
        while True:
            url = f"{self.base_url}/getallmanufacturers?format=json&page={page}"
            print(f"Fetching page {page}...")
            
            data = await self.make_request(client, url)
            if not data or "Results" not in data:
                break
                
            results = data["Results"]
            if not results:
                break
                
            all_manufacturers.extend(results)
            print(f"Page {page}: {len(results)} manufacturers")
            
            page += 1
            
        print(f"✅ Downloaded {len(all_manufacturers)} manufacturers")
        return all_manufacturers

    async def download_makes(self, client: httpx.AsyncClient) -> list[dict[str, Any]]:
        """Download all makes/brands"""
        print("📥 Downloading makes...")
        
        url = f"{self.base_url}/getallmakes?format=json"
        data = await self.make_request(client, url)
        
        if data and "Results" in data:
            makes = data["Results"]
            print(f"✅ Downloaded {len(makes)} makes")
            return makes
        
        print("❌ Failed to download makes")
        return []

    async def download_makes_for_manufacturer(self, client: httpx.AsyncClient, manufacturer_name: str) -> list[dict[str, Any]]:
        """Download makes for specific manufacturer"""
        encoded_name = urllib.parse.quote(manufacturer_name)
        url = f"{self.base_url}/getmakeformanufacturer/{encoded_name}?format=json"
        
        data = await self.make_request(client, url)
        if data and "Results" in data:
            return data["Results"]
        return []

    async def download_manufacturer_makes_mapping(self, client: httpx.AsyncClient, manufacturers: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Download manufacturer-make relationships"""
        print("📥 Downloading manufacturer-make mappings...")
        
        all_mappings = []
        total = len(manufacturers)
        
        for i, manufacturer in enumerate(manufacturers):
            if i % 10 == 0:
                print(f"   Progress: {i}/{total}")
                
            mfr_name = manufacturer.get("Mfr_Name", "")
            mfr_id = manufacturer.get("Mfr_ID")
            
            if not mfr_name or not mfr_id:
                continue
                
            makes = await self.download_makes_for_manufacturer(client, mfr_name)
            
            for make in makes:
                mapping = {
                    "manufacturer_id": mfr_id,
                    "make_id": make.get("Make_ID"),
                    "make_name": make.get("Make_Name"),
                    "manufacturer_name": mfr_name
                }
                all_mappings.append(mapping)
        
        print(f"✅ Downloaded {len(all_mappings)} manufacturer-make mappings")
        return all_mappings

    async def download_vehicle_types(self, client: httpx.AsyncClient, makes: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Download vehicle types for all makes"""
        print("📥 Downloading vehicle types...")
        
        all_vehicle_types = set()
        total = len(makes)
        
        for i, make in enumerate(makes):
            if i % 50 == 0:
                print(f"   Progress: {i}/{total}")
                
            make_id = make.get("Make_ID")
            if not make_id:
                continue
                
            url = f"{self.base_url}/getvehicletypesformakeid/{make_id}?format=json"
            data = await self.make_request(client, url)
            
            if data and "Results" in data:
                for vtype in data["Results"]:
                    type_name = vtype.get("VehicleTypeName")
                    if type_name:
                        all_vehicle_types.add(type_name)
        
        # Convert to list of dictionaries
        vehicle_types = [{"name": vtype} for vtype in sorted(all_vehicle_types)]
        print(f"✅ Downloaded {len(vehicle_types)} unique vehicle types")
        return vehicle_types

    async def download_models_for_make(self, client: httpx.AsyncClient, make_id: int, make_name: str, years: list[int]) -> list[dict[str, Any]]:
        """Download models for make by years"""
        all_models = []
        
        for year in years:
            url = f"{self.base_url}/getmodelsformakeidyear/makeid/{make_id}/modelyear/{year}?format=json"
            data = await self.make_request(client, url)
            
            if data and "Results" in data:
                for model in data["Results"]:
                    model_entry = {
                        "make_id": make_id,
                        "make_name": make_name,
                        "model_id": model.get("Model_ID"),
                        "model_name": model.get("Model_Name"),
                        "year": year
                    }
                    all_models.append(model_entry)
        
        return all_models

    async def download_models_and_years(self, client: httpx.AsyncClient, makes: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        """Download models and years for all makes"""
        print("📥 Downloading models and years...")
        
        # Year range for downloading
        current_year = datetime.now().year
        years = list(range(1995, current_year + 1))
        
        all_models = []
        all_model_years = []
        total = len(makes)
        
        for i, make in enumerate(makes[:100]):  # Limit for testing
            if i % 5 == 0:
                print(f"   Progress: {i}/{min(100, total)}")
                
            make_id = make.get("Make_ID")
            make_name = make.get("Make_Name")
            
            if not make_id or not make_name:
                continue
                
            models = await self.download_models_for_make(client, make_id, make_name, years)
            
            # Group models and years
            unique_models = {}
            for model in models:
                model_name = model["model_name"]
                if model_name not in unique_models:
                    unique_models[model_name] = {
                        "make_id": make_id,
                        "model_name": model_name,
                        "years": []
                    }
                unique_models[model_name]["years"].append(model["year"])
            
            # Add to result
            for model_name, model_data in unique_models.items():
                all_models.append({
                    "make_id": model_data["make_id"],
                    "model_name": model_name
                })
                
                for year in model_data["years"]:
                    all_model_years.append({
                        "make_id": model_data["make_id"],
                        "model_name": model_name,
                        "year": year
                    })
        
        print(f"✅ Downloaded {len(all_models)} models and {len(all_model_years)} model-year combinations")
        return all_models, all_model_years

    async def save_to_json(self, data: list[dict[str, Any]], filename: str):
        """Save data to JSON file"""
        filepath = self.data_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Saved {len(data)} records to {filename}")

    async def download_all_data(self):
        """Download all data from vPIC API"""
        print("🚀 Starting vPIC data download...")
        start_time = time.time()
        
        async with httpx.AsyncClient() as client:
            # 1. Manufacturers (with pagination)
            manufacturers = await self.download_manufacturers_paginated(client)
            await self.save_to_json(manufacturers, "manufacturers.json")
            
            # 2. Makes/brands
            makes = await self.download_makes(client)
            await self.save_to_json(makes, "makes.json")
            
            # 3. Manufacturer-make relationships
            manufacturer_makes = await self.download_manufacturer_makes_mapping(client, manufacturers[:100])  # Limit for testing
            await self.save_to_json(manufacturer_makes, "manufacturer_makes.json")
            
            # 4. Vehicle types
            vehicle_types = await self.download_vehicle_types(client, makes[:100])  # Limit for testing
            await self.save_to_json(vehicle_types, "vehicle_types.json")
            
            # 5. Models and years
            models, model_years = await self.download_models_and_years(client, makes)
            await self.save_to_json(models, "models.json")
            await self.save_to_json(model_years, "model_years.json")
        
        elapsed = time.time() - start_time
        print(f"✅ Download completed in {elapsed:.2f} seconds")


async def main():
    """Main function"""
    downloader = VPICDownloader()
    await downloader.download_all_data()


if __name__ == "__main__":
    asyncio.run(main())
