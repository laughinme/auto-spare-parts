from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from domain.organizations.schemas import AccountSessionRequest, AccountSessionResponse, AccountResponse
from database.relational_db import User
from core.security import auth_user
from service.payments import StripeService, get_stripe_service

router = APIRouter()


@router.post(
    path='/account',
    response_model=AccountResponse,
    summary='Create Stripe account'
)
async def create_account(
    user: Annotated[User, Depends(auth_user)],
    stripe_service: StripeService = Depends(get_stripe_service),
):
    try:
        account_id = await stripe_service.create_account()
        return AccountResponse(account=account_id)
    except Exception as e:
        print('An error occurred when calling the Stripe API to create an account: ', e)
        raise HTTPException(status_code=503, detail=str(e))


@router.post(
    path='/account_session',
    response_model=AccountSessionResponse,
    summary='Create Stripe account session'
)
async def create_account_session(
    payload: AccountSessionRequest,
    user: Annotated[User, Depends(auth_user)],
    stripe_service: StripeService = Depends(get_stripe_service),
):
    try:
        client_secret = await stripe_service.create_account_session(payload.account)
        return AccountSessionResponse(client_secret=client_secret)
    except Exception as e:
        print('An error occurred when calling the Stripe API to create an account session: ', e)
        raise HTTPException(status_code=503, detail=str(e))
