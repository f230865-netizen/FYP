from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, DatasetSession
from services.auth_service import get_current_user

import magic
import os
import uuid
import shutil
from pathlib import Path


router = APIRouter(prefix="/api", tags=["Upload"])


# Temp folder for uploaded files during session
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def detect_modality(file_path: str, filename: str) -> str:
    """Detect whether uploaded file is tabular or image based on MIME type."""
    try:
        mime = magic.from_file(file_path, mime=True)
    except Exception:
        mime = ""

    ext = Path(filename).suffix.lower()

    tabular_mimes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/json",
        "text/plain",
    ]

    tabular_exts = [".csv", ".xlsx", ".xls", ".json", ".tsv"]

    image_exts = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]
    image_mimes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
    ]

    if mime in tabular_mimes or ext in tabular_exts:
        return "tabular"

    if mime in image_mimes or ext in image_exts:
        return "image"

    return "unsupported"


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accept a dataset file upload, detect its modality, and return a session ID."""

    # Generate unique session ID for this upload
    session_id = str(uuid.uuid4())

    # Save file temporarily
    file_ext = Path(file.filename).suffix.lower()
    temp_path = UPLOAD_DIR / f"{session_id}{file_ext}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File save failed: {str(e)}",
        )

    # Get file size
    file_size = os.path.getsize(temp_path)
    file_size_mb = round(file_size / (1024 * 1024), 2)

    # Detect modality
    modality = detect_modality(str(temp_path), file.filename)

    if modality == "unsupported":
        # Clean up unsupported file
        os.remove(temp_path)

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a CSV, Excel, JSON, or image file.",
        )
        
    session = DatasetSession(
    id=uuid.UUID(session_id),
    user_id=current_user.id,
    filename=file.filename,
    modality=modality,
    file_size_mb=file_size_mb,
    file_path=str(temp_path),
    status="uploaded",
    ai_suggestions=0,
    )

    db.add(session)
    db.commit()

    return {
        "session_id": session_id,
        "filename": file.filename,
        "modality": modality,
        "file_size_mb": file_size_mb,
        "file_path": str(temp_path),
        "message": f"File uploaded successfully. Detected as {modality} dataset.",
    }
