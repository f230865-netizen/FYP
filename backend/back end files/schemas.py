from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    is_new_user: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class UserProfileOut(BaseModel):
    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[str] = None

    persona: Optional[str] = None
    skill_level: Optional[str] = None
    default_modality: Optional[str] = None
    ai_mode: Optional[str] = None
    use_case: Optional[str] = None


class UserPreferencesOut(BaseModel):
    numeric_impute: str
    categorical_impute: str
    outlier_method: str
    outlier_action: str
    auto_fix_types: bool
    duplicate_action: str
    pdf_language: str
    blur_threshold: float


class UserPreferencesUpdate(BaseModel):
    numeric_impute: Optional[str] = None
    categorical_impute: Optional[str] = None
    outlier_method: Optional[str] = None
    outlier_action: Optional[str] = None
    auto_fix_types: Optional[bool] = None
    duplicate_action: Optional[str] = None
    pdf_language: Optional[str] = None
    blur_threshold: Optional[float] = None
