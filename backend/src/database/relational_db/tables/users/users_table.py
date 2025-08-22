from uuid import UUID, uuid4
from datetime import datetime, date
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Uuid, String, Boolean, DateTime, false, Text, Index
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    
    # Credentials
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Profile info
    username: Mapped[str | None] = mapped_column(String, nullable=True)
    profile_pic_url: Mapped[str | None] = mapped_column(String, nullable=True)
    bio: Mapped[str | None] = mapped_column(String, nullable=True)
    language_code: Mapped[str | None] = mapped_column(
        String(2), ForeignKey('languages.code'), nullable=True
    )
    
    # Service
    # role: Mapped[Role] = mapped_column(Enum(Role), nullable=False, default=Role.GUEST)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=false())
    is_onboarded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    banned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    __table_args__ = (
        # GIN trigram indexes for fast text search
        Index(
            'users_username_trgm',
            'username',
            postgresql_using='gin',
            postgresql_ops={'username': 'gin_trgm_ops'}
        ),
        Index(
            'users_email_trgm',
            'email',
            postgresql_using='gin',
            postgresql_ops={'email': 'gin_trgm_ops'}
        ),
    )
    
    organization: Mapped["Organization"] = relationship(back_populates="owner", lazy="selectin") # type: ignore
    garage: Mapped[list["GarageVehicle"]] = relationship(back_populates="user", lazy="selectin") # type: ignore
