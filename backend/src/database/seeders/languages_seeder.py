from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables.languages.languages_table import Language


class LanguagesSeeder(BaseSeeder):
    """Seeder for common languages"""

    async def seed(self) -> None:
        existing_count = await self.get_record_count(Language)
        if existing_count > 0 and not self.force:
            self.log_progress(f"Table already has {existing_count} languages, skipping...")
            return

        if self.force:
            self.log_progress("Deleting existing languages...")
            await self.session.execute(delete(Language))

        languages = [
            {"code": "en", "name_ru": "English", "name_en": "English"},
            {"code": "ru", "name_ru": "Russian", "name_en": "Russian"},
            {"code": "es", "name_ru": "Spanish", "name_en": "Spanish"},
            {"code": "de", "name_ru": "German", "name_en": "German"},
            {"code": "fr", "name_ru": "French", "name_en": "French"},
            {"code": "it", "name_ru": "Italian", "name_en": "Italian"},
            {"code": "tr", "name_ru": "Turkish", "name_en": "Turkish"},
        ]

        stmt = insert(Language).values(languages)
        stmt = stmt.on_conflict_do_update(
            index_elements=["code"],
            set_={
                "name_ru": stmt.excluded.name_ru,
                "name_en": stmt.excluded.name_en,
            },
        )
        await self.session.execute(stmt)
        await self.commit()

        self.log_progress(f"Successfully seeded {len(languages)} languages")
        await self.verify_count(Language, len(languages), "languages")
