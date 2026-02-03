from enum import Enum

class CartItemStatus(Enum):
    """
    Cart item statuses. Needed mainly for orders.
    Active items are returned in the cart by default.
    Locked items are included in response when include_locked is True.
    Purchased and Removed items are never returned in the cart.
    """
    
    ACTIVE = "active"
    LOCKED = "locked"
    PURCHASED = "purchased"
    REMOVED = "removed"
