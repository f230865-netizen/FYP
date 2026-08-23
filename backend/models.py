from sqlalchemy import Column, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    is_new_user = Column(Boolean, default=True)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    persona = Column(String, nullable=True)        # student, analyst, scientist, business
    skill_level = Column(String, nullable=True)    # beginner, intermediate, expert
    default_modality = Column(String, nullable=True) # tabular, image, mixed
    ai_mode = Column(String, nullable=True)        # explain_all, suggest, auto
    use_case = Column(String, nullable=True)       # ml, reporting, sharing

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    numeric_impute = Column(String, default="median")
    categorical_impute = Column(String, default="mode")
    outlier_method = Column(String, default="iqr")
    outlier_action = Column(String, default="flag")
    auto_fix_types = Column(Boolean, default=True)
    duplicate_action = Column(String, default="ask")
    pdf_language = Column(String, default="simple")
    blur_threshold = Column(Float, default=100.0)
    updated_at = Column(DateTime, default=func.now())
