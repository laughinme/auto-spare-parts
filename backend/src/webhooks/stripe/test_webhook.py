import stripe

from fastapi import APIRouter, Request, HTTPException
from logging import getLogger

from core.config import Settings

router = APIRouter()
settings = Settings() # type: ignore
logger = getLogger(__name__)

STRIPE_LOCAL_CONNECT_WEBHOOK_SECRET = settings.STRIPE_LOCAL_CONNECT_WEBHOOK_SECRET


async def _parse_event(request: Request):
    try:
        payload_bytes = await request.body()
        sig = request.headers.get("Stripe-Signature")
        # Construct the webhook event
        event = stripe.Webhook.construct_event(
            payload=payload_bytes, sig_header=sig, secret=STRIPE_LOCAL_CONNECT_WEBHOOK_SECRET
        )
        return event
    except stripe.SignatureVerificationError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")


@router.post("/local", summary="Test webhook (no-op, accepts any Connect event)")
async def handle_test_any(request: Request):
    try:
        event = await _parse_event(request)
        logger.info(f"Received Stripe event {event.id} type={event.type}")
        return {"received": True, "type": event.type}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {e!s}")
        raise HTTPException(status_code=500, detail=f"Webhook error: {e!s}")
