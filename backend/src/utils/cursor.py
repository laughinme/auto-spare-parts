from datetime import datetime
from uuid import UUID
# from typing import TypeVar, Protocol
from fastapi import HTTPException


# class CursorModel(Protocol):
#     created_at: datetime | None
#     id: UUID

# T = TypeVar('T', bound=CursorModel)

def parse_cursor(cursor: str | None) -> dict:
    cursor_created_at = None
    cursor_id = None
    if cursor:
        try:
            ts_str, id_str = cursor.split("_", 1)
            cursor_created_at = datetime.fromisoformat(ts_str)
            cursor_id = UUID(id_str)
        except Exception:
            raise HTTPException(400, detail='Invalid cursor')
    return {
        'cursor_created_at': cursor_created_at,
        'cursor_id': cursor_id
    }
    
def create_cursor(items: list, limit: int) -> str | None:
    next_cursor = None
    if len(items) == limit:
        last = items[-1]
        if last.created_at is None:
            next_cursor = None
        else:
            next_cursor = f"{last.created_at.isoformat()}_{last.id}"
    return next_cursor
