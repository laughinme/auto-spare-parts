from enum import Enum


class MembershipRole(Enum):
    OWNER = "owner"
    ADMIN = "admin"
    STAFF = "staff"
    ACCOUNTANT = "accountant"
