import stripe
from logging import getLogger

from fastapi import APIRouter, HTTPException, Request

from core.config import Settings
from database.relational_db import UoW, OrganizationsInterface
from service.organizations import OrganizationService, get_organization_service
from service.payments import StripeService, get_stripe_service

router = APIRouter()
settings = Settings() # type: ignore
logger = getLogger(__name__)

STRIPE_CONNECT_WEBHOOK_SECRET = settings.STRIPE_CONNECT_WEBHOOK_SECRET


async def _parse_event(request: Request):
    try:
        payload_bytes = await request.body()
        sig = request.headers.get("Stripe-Signature")
        # Construct the webhook event
        event = stripe.Webhook.construct_event(
            payload=payload_bytes, sig_header=sig, secret=STRIPE_CONNECT_WEBHOOK_SECRET
        )
        # Instead of using to_dict(), work directly with the event object
        return event
    except stripe.SignatureVerificationError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")


@router.post("/onboarding", summary="Handle Stripe Connect onboarding webhook")
async def handle_onboarding(request: Request):
    try:
        event = await _parse_event(request)
        logger.info(f"Received Stripe event {event.id} type={event.type}")
        return {"received": True, "type": event.type}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {e!s}")
        raise HTTPException(status_code=500, detail=f"Webhook error: {e!s}")
