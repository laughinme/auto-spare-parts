import stripe
from core.config import Settings

settings = Settings()  # type: ignore

def init_stripe() -> None:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    stripe.api_version = '2023-10-16'
