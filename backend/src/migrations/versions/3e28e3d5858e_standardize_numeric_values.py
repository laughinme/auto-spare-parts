"""standardize Numeric values

Revision ID: 3e28e3d5858e
Revises: a617fb5ddf4a
Create Date: 2025-08-28 21:31:29.229281

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e28e3d5858e'
down_revision: Union[str, Sequence[str], None] = 'a617fb5ddf4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Convert float columns to Numeric(12,2)."""
    
    # Convert products.price from float to Numeric(12,2)
    op.execute("""
        ALTER TABLE products 
        ALTER COLUMN price TYPE NUMERIC(12,2) USING price::NUMERIC(12,2)
    """)
    
    # Convert cart_items.unit_price from float to Numeric(12,2)
    op.execute("""
        ALTER TABLE cart_items 
        ALTER COLUMN unit_price TYPE NUMERIC(12,2) USING unit_price::NUMERIC(12,2)
    """)
    
    # Convert orders.total_amount from float to Numeric(12,2)
    op.execute("""
        ALTER TABLE orders 
        ALTER COLUMN total_amount TYPE NUMERIC(12,2) USING total_amount::NUMERIC(12,2)
    """)
    
    # Convert order_items.unit_price from float to Numeric(12,2)
    op.execute("""
        ALTER TABLE order_items 
        ALTER COLUMN unit_price TYPE NUMERIC(12,2) USING unit_price::NUMERIC(12,2)
    """)
    
    # Convert order_items.total_price from float to Numeric(12,2)
    op.execute("""
        ALTER TABLE order_items 
        ALTER COLUMN total_price TYPE NUMERIC(12,2) USING total_price::NUMERIC(12,2)
    """)


def downgrade() -> None:
    """Downgrade schema: Convert Numeric(12,2) columns back to float."""
    
    # Convert products.price back to float
    op.execute("""
        ALTER TABLE products 
        ALTER COLUMN price TYPE DOUBLE PRECISION USING price::DOUBLE PRECISION
    """)
    
    # Convert cart_items.unit_price back to float
    op.execute("""
        ALTER TABLE cart_items 
        ALTER COLUMN unit_price TYPE DOUBLE PRECISION USING unit_price::DOUBLE PRECISION
    """)
    
    # Convert orders.total_amount back to float
    op.execute("""
        ALTER TABLE orders 
        ALTER COLUMN total_amount TYPE DOUBLE PRECISION USING total_amount::DOUBLE PRECISION
    """)
    
    # Convert order_items.unit_price back to float
    op.execute("""
        ALTER TABLE order_items 
        ALTER COLUMN unit_price TYPE DOUBLE PRECISION USING unit_price::DOUBLE PRECISION
    """)
    
    # Convert order_items.total_price back to float
    op.execute("""
        ALTER TABLE order_items 
        ALTER COLUMN total_price TYPE DOUBLE PRECISION USING total_price::DOUBLE PRECISION
    """)
