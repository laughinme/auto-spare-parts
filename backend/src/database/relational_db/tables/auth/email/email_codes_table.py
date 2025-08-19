from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import UUID, DateTime, Uuid, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import BYTEA

from ...table_base import Base
from ...mixins import TimestampMixin


class EmailCode(TimestampMixin, Base):
    __tablename__ = "email_verification_codes"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False
    )
    
    code_hash: Mapped[bytes] = mapped_column(BYTEA, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
