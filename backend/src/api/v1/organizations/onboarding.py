from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from domain.organizations.schemas import AccountSessionRequest, AccountSessionResponse, AccountResponse
from database.relational_db import User
from core.security import auth_user
from service.payments import StripeService, get_stripe_service
from service.organizations import OrganizationService, get_organization_service

router = APIRouter()


@router.post(
    path='/account',
    response_model=AccountResponse,
    summary='Create Organization and Stripe account'
)
async def create_account(
    user: Annotated[User, Depends(auth_user)],
    org_svc: Annotated[OrganizationService, Depends(get_organization_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
):
    org = await org_svc.create_organization(user, 'US', 'Test Organization')
    try:
        account_id = await stripe_svc.create_account()
        org.stripe_account_id = account_id
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
    org_svc: Annotated[OrganizationService, Depends(get_organization_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
):
    org = await org_svc.get_by_stripe_account_id(payload.account)
    if not org:
        raise HTTPException(status_code=404, detail='Organization not found')
    
    if org.owner_user_id != user.id:
        raise HTTPException(status_code=400, detail='You are not the owner of this organization')
    
    try:
        client_secret = await stripe_svc.create_account_session(payload.account)
        return AccountSessionResponse(client_secret=client_secret)
    except Exception as e:
        print('An error occurred when calling the Stripe API to create an account session: ', e)
        raise HTTPException(status_code=503, detail=str(e))
