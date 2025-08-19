from fastapi import Depends

from database.relational_db import (
    UserInterface,
    get_uow,
    UoW,
    LanguagesInterface,
)
from .user_service import UserService


async def get_user_service(
    uow: UoW = Depends(get_uow),
) -> UserService:
    user_repo = UserInterface(uow.session)
    lang_repo = LanguagesInterface(uow.session)
    return UserService(uow, user_repo, lang_repo)
