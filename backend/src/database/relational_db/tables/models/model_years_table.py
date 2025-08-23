from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey, Integer

from ..table_base import Base
from ..mixins import TimestampMixin


class ModelYear(TimestampMixin, Base):
    """Model years table for storing production years for specific vehicle models"""
    __tablename__ = "model_years"

    model_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("models.model_id", ondelete="CASCADE"), primary_key=True, comment="Reference to the model"
    )
    year: Mapped[int] = mapped_column(
        Integer, primary_key=True, comment="Production year for the model"
    )
    vehicle_type_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("vehicle_types.vehicle_type_id", ondelete="CASCADE"), nullable=True, comment="Optional reference to vehicle type for this model year"
    )
