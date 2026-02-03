from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from domain.payments import PaymentStatus
from .checkouts_table import CheckoutSession


class CheckoutSessionInterface:
    """Interface for working with checkout sessions in database"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, checkout_session: CheckoutSession) -> CheckoutSession:
        """Add new checkout session to session"""
        self.session.add(checkout_session)
        return checkout_session

    async def get_by_id(self, id: UUID | str) -> CheckoutSession | None:
        """Get checkout session by ID"""
        return await self.session.scalar(
            select(CheckoutSession).where(CheckoutSession.id == id)
        )
