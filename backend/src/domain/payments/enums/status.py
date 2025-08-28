from enum import Enum


class PaymentStatus(Enum):
    """Payment status"""
    
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    # PARTIALLY_REFUNDED = "partially_refunded"
    # PARTIALLY_PAID = "partially_paid"
