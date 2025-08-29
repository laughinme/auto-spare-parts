import stripe

from fastapi import APIRouter, Request, HTTPException
from logging import getLogger

from core.config import Settings

router = APIRouter()
settings = Settings() # type: ignore
logger = getLogger(__name__)


async def parse_event(
    request: Request,
    secret: str | None = settings.STRIPE_LOCAL_CONNECT_WEBHOOK_SECRET,
) -> stripe.Event:
    try:
        payload_bytes = await request.body()
        sig = request.headers.get("Stripe-Signature")
        # Construct the webhook event
        event = stripe.Webhook.construct_event(
            payload=payload_bytes, sig_header=sig, secret=secret
        )
        return event
    except stripe.SignatureVerificationError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
