"""fix media uploading

Revision ID: 08555972e533
Revises: aef1e0dddb2b
Create Date: 2025-08-22 12:37:55.657803
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '08555972e533'
down_revision: Union[str, Sequence[str], None] = 'aef1e0dddb2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text("""
        UPDATE users
        SET profile_pic_url = NULL
        WHERE profile_pic_url IS NOT NULL
    """))

    op.execute(sa.text("TRUNCATE TABLE product_media RESTART IDENTITY CASCADE"))


def downgrade() -> None:
    pass
