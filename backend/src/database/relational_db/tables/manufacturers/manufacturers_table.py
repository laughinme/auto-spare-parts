from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, ForeignKey, Uuid, Text, Numeric
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import TimestampMixin


class Manufacturer(TimestampMixin, Base):
    """Manufacturers table from vPIC database"""
    __tablename__ = "manufacturers"

    # Primary key - using vPIC manufacturer ID
    manufacturer_id: Mapped[int] = mapped_column(primary_key=True, comment="vPIC manufacturer ID")
    
    # Basic manufacturer information
    name: Mapped[str] = mapped_column(String, nullable=False, comment="Official manufacturer name")
    mfr_common_name: Mapped[str | None] = mapped_column(String, nullable=True, comment="Common name or brand name")
    country: Mapped[str | None] = mapped_column(String, nullable=True, comment="Country of manufacturer")
    
    # Status and type information from vPIC
    status: Mapped[str | None] = mapped_column(String, nullable=True, comment="Manufacturer status")
    type: Mapped[str | None] = mapped_column(String, nullable=True, comment="Manufacturer type or vehicle types")
