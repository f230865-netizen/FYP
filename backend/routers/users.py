from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User, UserProfile
from schemas import UserOut
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

router = APIRouter(prefix="/users", tags=["Users"])


def get_current_user(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class OnboardingData(BaseModel):
    persona: Optional[str] = None
    skill_level: Optional[str] = None
    default_modality: Optional[str] = None
    ai_mode: Optional[str] = None
    use_case: Optional[str] = None


@router.post("/onboarding")
def save_onboarding(
    data: OnboardingData,
    token: str,
    db: Session = Depends(get_db)
):
    user = get_current_user(token, db)

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    if profile:
        profile.persona = data.persona
        profile.skill_level = data.skill_level
        profile.default_modality = data.default_modality
        profile.ai_mode = data.ai_mode
        profile.use_case = data.use_case
    else:
        profile = UserProfile(
            user_id=user.id,
            persona=data.persona,
            skill_level=data.skill_level,
            default_modality=data.default_modality,
            ai_mode=data.ai_mode,
            use_case=data.use_case,
        )
        db.add(profile)

    user.is_new_user = False
    db.commit()

    return {"message": "Onboarding saved successfully"}


@router.get("/profile", response_model=UserOut)
def get_profile(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    return user
