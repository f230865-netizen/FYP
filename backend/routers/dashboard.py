from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import User, DatasetSession, AuditLog
from services.auth_service import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_sessions = (
        db.query(func.count(DatasetSession.id))
        .filter(DatasetSession.user_id == current_user.id)
        .scalar()
        or 0
    )

    datasets_cleaned = (
        db.query(func.count(DatasetSession.id))
        .filter(
            DatasetSession.user_id == current_user.id,
            DatasetSession.status == "completed",
        )
        .scalar()
        or 0
    )

    avg_dqi_improvement = (
        db.query(
            func.avg(
                DatasetSession.dqi_after - DatasetSession.dqi_before
            )
        )
        .filter(
            DatasetSession.user_id == current_user.id,
            DatasetSession.dqi_before.isnot(None),
            DatasetSession.dqi_after.isnot(None),
        )
        .scalar()
    )

    ai_suggestions = (
        db.query(func.coalesce(func.sum(DatasetSession.ai_suggestions), 0))
        .filter(DatasetSession.user_id == current_user.id)
        .scalar()
        or 0
    )

    return {
        "total_sessions": total_sessions,
        "datasets_cleaned": datasets_cleaned,
        "avg_dqi_improvement": (
            round(float(avg_dqi_improvement), 2)
            if avg_dqi_improvement is not None
            else None
        ),
        "ai_suggestions": int(ai_suggestions),
    }


@router.get("/sessions")
def get_recent_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(DatasetSession)
        .filter(DatasetSession.user_id == current_user.id)
        .order_by(DatasetSession.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "session_id": str(session.id),
            "filename": session.filename,
            "modality": session.modality,
            "file_size_mb": session.file_size_mb,
            "status": session.status,
            "dqi_before": session.dqi_before,
            "dqi_after": session.dqi_after,
            "ai_suggestions": session.ai_suggestions,
            "created_at": session.created_at,
        }
        for session in sessions
    ]


@router.get("/datasets")
def get_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    datasets = (
        db.query(DatasetSession)
        .filter(DatasetSession.user_id == current_user.id)
        .order_by(DatasetSession.created_at.desc())
        .all()
    )

    return [
        {
            "session_id": str(dataset.id),
            "filename": dataset.filename,
            "modality": dataset.modality,
            "file_size_mb": dataset.file_size_mb,
            "status": dataset.status,
            "created_at": dataset.created_at,
        }
        for dataset in datasets
    ]


@router.get("/logs")
def get_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": str(log.id),
            "session_id": str(log.session_id),
            "timestamp": log.timestamp,
            "column_name": log.column_name,
            "issue_detected": log.issue_detected,
            "technique_used": log.technique_used,
            "ai_suggested": log.ai_suggested,
            "user_override": log.user_override,
            "rows_affected": log.rows_affected,
            "dqi_before": log.dqi_before,
            "dqi_after": log.dqi_after,
        }
        for log in logs
    ]
