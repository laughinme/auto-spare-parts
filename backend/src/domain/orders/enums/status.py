from enum import Enum


class OrderStatus(Enum):
    """Order status enumeration"""
    
    PENDING = "pending"          # Order created, awaiting payment
    CONFIRMED = "confirmed"      # Payment received, order confirmed
    PROCESSING = "processing"    # Order being prepared/shipped
    SHIPPED = "shipped"          # Order shipped to buyer
    DELIVERED = "delivered"      # Order delivered successfully
    CANCELLED = "cancelled"      # Order cancelled
    REFUNDED = "refunded"        # Order refunded
