from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, ForeignKey, Integer

from ..table_base import Base
from ..mixins import TimestampMixin


class Model(TimestampMixin, Base):
    """Vehicle models table for storing different vehicle models"""
    __tablename__ = "models"

    # model_id: Mapped[int] = mapped_column(
    #     Integer,
    #     primary_key=True,
    #     comment="Primary key for model"
    # )
    model_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Surrogate primary key for model"
    )
    make_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("makes.make_id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to the make this model belongs to"
    )
    model_name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        comment="Name of the vehicle model"
    )
