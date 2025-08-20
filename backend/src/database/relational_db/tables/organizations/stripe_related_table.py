from datetime import datetime
from sqlalchemy import Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..table_base import Base
from ..mixins import CreatedAtMixin


class StripeEvent(CreatedAtMixin, Base):
    __tablename__ = 'stripe_events'

    id: Mapped[str] = mapped_column(Text, primary_key=True)  # Stripe event id
    type: Mapped[str] = mapped_column(Text, nullable=False)
    account_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
