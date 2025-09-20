from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

# User Role Schemas
class UserRoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleUpdate(UserRoleBase):
    name: Optional[str] = None

class UserRoleInDB(UserRoleBase):
    id: UUID
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role_id: UUID
    avatar: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_id: Optional[UUID] = None
    avatar: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)

class UserInDB(UserBase):
    id: UUID
    
    class Config:
        from_attributes = True

class UserWithRole(UserInDB):
    role: UserRoleInDB
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: UUID
    email: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)