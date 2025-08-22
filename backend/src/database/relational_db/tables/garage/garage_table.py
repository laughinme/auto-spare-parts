from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Uuid, String, Integer, ForeignKeyConstraint
from sqlalchemy.dialects.postgresql import JSONB

from ..table_base import Base
from ..mixins import TimestampMixin


class GarageVehicle(TimestampMixin, Base):
    __tablename__ = "garage_vehicles"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False
    )
    make_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('makes.make_id', ondelete='CASCADE'), nullable=False
    )
    model_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('models.model_id', ondelete='CASCADE'), nullable=False
    )
    year: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    vehicle_type_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey('vehicle_types.vehicle_type_id', ondelete='CASCADE'), nullable=True
    )
    vin: Mapped[str | None] = mapped_column(String, nullable=True)
    vin_decoded: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    
    user: Mapped["User"] = relationship(back_populates="garage", lazy="selectin") # type: ignore
    make: Mapped["Make"] = relationship(lazy="selectin") # type: ignore
    model: Mapped["Model"] = relationship(lazy="selectin") # type: ignore
    model_year: Mapped["ModelYear"] = relationship(lazy="selectin") # type: ignore
    vehicle_type: Mapped["VehicleType"] = relationship(lazy="selectin") # type: ignore

    __table_args__ = (
        ForeignKeyConstraint(
            ['model_id', 'year'],
            ['model_years.model_id', 'model_years.year'],
            name='fk_garage_model_year',
            ondelete='CASCADE'
        ),
    )
