import aiofiles
import shutil
from datetime import date, datetime

from uuid import UUID, uuid4
from pathlib import Path
from fastapi import UploadFile, status, HTTPException

from core.config import Settings
from domain.users import UserPatch, ExpandUserFields, UserModel
from domain.organizations import OrganizationModel
from database.relational_db import (
    UoW,
    UserInterface, 
    User,
    LanguagesInterface,
)

settings = Settings() # type: ignore

class UserService:
    def __init__(
        self,
        uow: UoW,
        user_repo: UserInterface,
        lang_repo: LanguagesInterface,
    ):
        self.uow = uow
        self.user_repo = user_repo
        self.lang_repo = lang_repo
        
    async def get_user(self, user_id: UUID | str) -> User | None:
        return await self.user_repo.get_by_id(user_id)
        
    async def patch_user(self, payload: UserPatch, user: User):
        data = payload.model_dump(exclude_none=True)
        
        for field, value in data.items():
            setattr(user, field, value)
            
        await self.uow.commit()
            
        await self.uow.session.refresh(user)
        
    # async def for_profile(self, user_id: UUID | str, expand: set[ExpandUserFields]) -> UserModel:
    #     # Convert enum set to raw values for low-level repository consumption.
    #     expand_tokens = {field.value for field in expand}

    #     user = await self.user_repo.custom_load(
    #         id=user_id,
    #         expand=expand_tokens,
    #     )
    #     if user is None:
    #         raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found")
    #     return self._build_profile_model(user, expand)

    # def _build_profile_model(
    #     self,
    #     user: User,
    #     expand: set[ExpandUserFields],
    # ) -> UserModel:
    #     # Base payload always includes scalar attributes from the users table.
    #     payload = {
    #         "id": user.id,
    #         "email": user.email,
    #         "username": user.username,
    #         "profile_pic_url": user.profile_pic_url,
    #         "bio": user.bio,
    #         "language_code": user.language_code,
    #         "is_onboarded": user.is_onboarded,
    #         "banned": user.banned,
    #         "created_at": user.created_at,
    #         "updated_at": user.updated_at,
    #     }

    #     # Attach organization details only when expansion is enabled.
    #     if ExpandUserFields.ORGANIZATION in expand:
    #         organization = getattr(user, "organization", None)
    #         payload["organization"] = (
    #             OrganizationModel.model_validate(
    #                 organization,
    #                 from_attributes=True,
    #             )
    #             if organization is not None
    #             else None
    #         )

    #     # Attach role slugs only if roles were eagerly fetched.
    #     if ExpandUserFields.ROLES in expand:
    #         payload["roles"] = [role.slug for role in getattr(user, "roles", [])]

    #     return UserModel.model_validate(payload)

    async def add_picture(
        self,
        file: UploadFile,
        user: User
    ) -> None:
        folder = Path(settings.MEDIA_DIR, "users", str(user.id))
        if folder.exists():
            shutil.rmtree(folder)
        folder.mkdir(parents=True, exist_ok=True)

        if file.content_type not in ("image/jpeg", "image/png"):
            raise HTTPException(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only jpg / png allowed"
            )

        ext  = ".jpg" if file.content_type == "image/jpeg" else ".png"
        name = f"{uuid4().hex}{ext}"

        file_path = folder / name
        limit_bytes = settings.MAX_PHOTO_SIZE * 1024 * 1024
        written = 0
        async with aiofiles.open(file_path, "wb") as out:
            while chunk := await file.read(1024 * 1024):
                if written + len(chunk) > limit_bytes:
                    try:
                        await out.flush()
                        await out.close()
                    except Exception:
                        pass
                    try:
                        file_path.unlink(missing_ok=True)
                    except Exception:
                        pass
                    raise HTTPException(
                        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Max {settings.MAX_PHOTO_SIZE} MB"
                    )
                await out.write(chunk)
                written += len(chunk)

        url = f"{settings.SITE_URL}/{settings.MEDIA_DIR}/users/{user.id}/{name}"

        user.profile_pic_url = url

    async def admin_list_users(
        self,
        *,
        banned: bool | None = None,
        search: str | None = None,
        limit: int = 50,
        cursor: str | None = None,
    ) -> tuple[list[User], str | None]:
        cursor_created_at = None
        cursor_id = None
        if cursor:
            try:
                ts_str, id_str = cursor.split("_", 1)
                cursor_created_at = datetime.fromisoformat(ts_str)
                cursor_id = UUID(id_str)
            except Exception:
                raise HTTPException(400, detail='Invalid cursor')

        users = await self.user_repo.admin_list_users(
            banned=banned,
            search=search,
            limit=limit,
            cursor_created_at=cursor_created_at,
            cursor_id=cursor_id,
        )

        next_cursor = None
        if len(users) == limit:
            last = users[-1]
            if last.created_at is None:
                next_cursor = None
            else:
                next_cursor = f"{last.created_at.isoformat()}_{last.id}"

        return users, next_cursor

    async def admin_set_ban(self, target: User, banned: bool) -> User:
        target.banned = banned
        await self.uow.commit()
        await self.uow.session.refresh(target)
        return target

    async def list_languages(self, search: str, limit: int):
        return await self.lang_repo.search(search, limit)
