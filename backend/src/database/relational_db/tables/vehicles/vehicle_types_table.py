from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, Integer

from ..table_base import Base
from ..mixins import TimestampMixin


class VehicleType(TimestampMixin, Base):
    """Vehicle types table for categorizing different types of vehicles"""
    __tablename__ = "vehicle_types"

    vehicle_type_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
