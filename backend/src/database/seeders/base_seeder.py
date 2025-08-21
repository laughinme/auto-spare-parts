from abc import ABC, abstractmethod
from typing import Any
import json
import aiofiles
from pathlib import Path
from sqlalchemy import select, func

from database.relational_db import UoW


class BaseSeeder(ABC):
    """Base class for all seeders"""
    
    def __init__(self, uow: UoW, force: bool = False):
        self.uow = uow
        self.session = uow.session
        self.data_dir = Path(__file__).parent / "data"
        self.force = force
        
        print(f"Data directory: {self.data_dir}")
    
    @abstractmethod
    async def seed(self) -> None:
        pass
    
    async def load_json_data(self, file_name: str) -> list[dict[str, Any]]:
        """Load data from JSON file"""
        file_path = self.data_dir / file_name
        
        if not file_path.exists():
            print(f"Warning: File {file_path} does not exist")
            return []
            
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
            data = json.loads(content)
            
            # If this is a vPIC API response, extract Results
            if isinstance(data, dict) and "Results" in data:
                return data["Results"]
            
            # If this is already a list of data
            if isinstance(data, list):
                return data
                
            return []
    
    async def get_record_count(self, table_class) -> int:
        result = await self.session.execute(select(func.count()).select_from(table_class))
        return result.scalar() or 0
    
    async def commit(self):
        await self.uow.commit()
    
    def log_progress(self, message: str):
        """Logging progress"""
        print(f"[{self.__class__.__name__}] {message}")
