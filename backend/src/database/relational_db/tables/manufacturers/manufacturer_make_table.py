from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey, Integer

from ..table_base import Base
from ..mixins import TimestampMixin


class ManufacturerMake(TimestampMixin, Base):
    """Junction table linking manufacturers to the makes they produce"""
    __tablename__ = "manufacturer_make"

    manufacturer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("manufacturers.manufacturer_id", ondelete="CASCADE"),
        primary_key=True,
        comment="vPIC manufacturer ID"
    )
    make_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("makes.make_id", ondelete="CASCADE"),
        primary_key=True,
        comment="vPIC make ID"
    )
