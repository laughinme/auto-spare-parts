from enum import Enum


class OrderBy(Enum):
    """Order filters"""
    
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    CREATED_AT_ASC = "created_at_asc"
    CREATED_AT_DESC = "created_at_desc"
