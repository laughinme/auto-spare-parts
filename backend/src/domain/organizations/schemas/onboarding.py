from pydantic import BaseModel


class AccountSessionRequest(BaseModel):
    account: str

class AccountSessionResponse(BaseModel):
    client_secret: str

class AccountResponse(BaseModel):
    account: str
