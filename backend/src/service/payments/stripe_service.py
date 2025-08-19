import stripe

from database.relational_db import UoW


class StripeService:
    """Service layer encapsulating all interactions with the Stripe API."""
    def __init__(self, uow: UoW):
        self.uow = uow

    async def create_account(self) -> str:
        account = stripe.Account.create(
            controller={
                "stripe_dashboard": {
                    "type": "none",
                },
                "fees": {
                    "payer": "application"
                },
                "losses": {
                    "payments": "application"
                },
                "requirement_collection": "application",
            },
            capabilities={
                "transfers": {"requested": True}
            },
            country="US",
        )

        return account.id

    async def create_account_session(self, account_id: str) -> str:
        account_session = stripe.AccountSession.create(
            account=account_id,
            components={
                "account_onboarding": {"enabled": True},
            },
        )

        return account_session.client_secret
