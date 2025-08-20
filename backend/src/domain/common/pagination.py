from typing import Generic, TypeVar, Any, Self
from pydantic import BaseModel, Field, TypeAdapter

T = TypeVar('T')

class CursorPage(BaseModel, Generic[T]):
    """Generic cursor-based pagination model"""
    items: list[T] = Field(..., description="List of items")
    next_cursor: str | None = Field(None, description="Cursor for next page")

    # @classmethod
    # def from_list(cls, items: list[Any], next_cursor: str | None) -> Self:
    #     adapter = TypeAdapter(cls)
    #     return adapter.validate_python(
    #         {'items': items, 'next_cursor': next_cursor},
    #         from_attributes=True,
    #     )


class Page(BaseModel, Generic[T]):
    """Generic offset/limit pagination model"""
    items: list[T] = Field(..., description="List of items")
    offset: int = Field(..., description="Offset from start", ge=0)
    limit: int = Field(..., description="Maximum number of items returned", ge=1)
    total: int = Field(..., description="Total number of items", ge=0)
