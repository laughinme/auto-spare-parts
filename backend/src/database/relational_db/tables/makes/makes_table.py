from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, Integer, Index

from ..table_base import Base
from ..mixins import TimestampMixin


class Make(TimestampMixin, Base):
    """Makes table from vPIC database"""
    __tablename__ = "makes"

    make_id: Mapped[int] = mapped_column(Integer, primary_key=True, comment="vPIC make ID")
    make_name: Mapped[str] = mapped_column(String, nullable=False, comment="Official make name")

    __table_args__ = (
        Index(
            'ix_makes_name_trgm',
            'make_name',
            postgresql_using='gin',
            postgresql_ops={'make_name': 'gin_trgm_ops'}
        ),
    )
