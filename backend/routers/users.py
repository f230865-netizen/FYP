from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserProfile, UserPreferences
from schemas import (
    UserOut,
    UserProfileOut,
    UserPreferencesOut,
    UserPreferencesUpdate,
)
from services.auth_service import get_current_user


router = APIRouter(prefix="/users", tags=["Users"])


class OnboardingData(BaseModel):
    persona: Optional[str] = None
    skill_level: Optional[str] = None
    default_modality: Optional[str] = None
    ai_mode: Optional[str] = None
    use_case: Optional[str] = None


@router.post("/onboarding")
def save_onboarding(
    data: OnboardingData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    if profile:
        profile.persona = data.persona
        profile.skill_level = data.skill_level
        profile.default_modality = data.default_modality
        profile.ai_mode = data.ai_mode
        profile.use_case = data.use_case
    else:
        profile = UserProfile(
            user_id=current_user.id,
            persona=data.persona,
            skill_level=data.skill_level,
            default_modality=data.default_modality,
            ai_mode=data.ai_mode,
            use_case=data.use_case,
        )
        db.add(profile)

    current_user.is_new_user = False

    db.commit()

    return {
        "message": "Onboarding saved successfully"
    }


@router.get("/profile", response_model=UserProfileOut)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    return UserProfileOut(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        created_at=(
            current_user.created_at.isoformat()
            if current_user.created_at
            else None
        ),
        persona=profile.persona if profile else None,
        skill_level=profile.skill_level if profile else None,
        default_modality=profile.default_modality if profile else None,
        ai_mode=profile.ai_mode if profile else None,
        use_case=profile.use_case if profile else None,
    )


@router.get("/preferences", response_model=UserPreferencesOut)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == current_user.id)
        .first()
    )

    if not preferences:
        preferences = UserPreferences(
            user_id=current_user.id
        )

        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return preferences


@router.put("/preferences", response_model=UserPreferencesOut)
def update_preferences(
    data: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == current_user.id)
        .first()
    )

    if not preferences:
        preferences = UserPreferences(
            user_id=current_user.id
        )
        db.add(preferences)

    update_data = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    for field, value in update_data.items():
        setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences
