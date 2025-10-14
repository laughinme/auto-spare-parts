from pydantic import BaseModel, Field
from datetime import datetime


class ConfirmDelivery(BaseModel):
    delivered_at: datetime | None = Field(
        None, description="Timestamp when the parcel was delivered. If not provided, the current timestamp will be used."
    )
