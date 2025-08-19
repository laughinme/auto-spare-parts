from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import stripe

from database.relational_db import User
from core.security import auth_user

router = APIRouter()


class AccountSessionRequest(BaseModel):
    account: str


class AccountSessionResponse(BaseModel):
    client_secret: str


class AccountResponse(BaseModel):
    account: str


@router.post(
    path='/account',
    response_model=AccountResponse,
    summary='Create Stripe account'
)
async def create_account(
    user: Annotated[User, Depends(auth_user)],
):
    try:
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

        return AccountResponse(
            account=account.id
        )
    except Exception as e:
        print('An error occurred when calling the Stripe API to create an account: ', e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    path='/account_session',
    response_model=AccountSessionResponse,
    summary='Create Stripe account session'
)
async def create_account_session(
    payload: AccountSessionRequest,
    user: Annotated[User, Depends(auth_user)],
):
    try:
        account_session = stripe.AccountSession.create(
            account=payload.account,
            components={
                "account_onboarding": {"enabled": True},
            },
        )

        return AccountSessionResponse(
            client_secret=account_session.client_secret
        )
    except Exception as e:
        print('An error occurred when calling the Stripe API to create an account session: ', e)
        raise HTTPException(status_code=500, detail=str(e))
