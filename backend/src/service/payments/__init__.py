from fastapi import Depends

from database.relational_db import UoW, get_uow
from .stripe_service import StripeService


async def get_stripe_service(
    uow: UoW = Depends(get_uow),
) -> StripeService:
    """Dependency injection function to get StripeService instance with unit of work."""
    return StripeService(uow)
