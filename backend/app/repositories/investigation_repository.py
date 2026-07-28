from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.investigation import Investigation


class InvestigationRepository:
    """
    Data access layer for Investigation records.
    All DB operations for investigations live here — API and service layers
    should not execute SQL directly.
    """

    # ------------------------------------------------------------------ #
    #  CREATE                                                              #
    # ------------------------------------------------------------------ #

    def create(
        self,
        db: Session,
        *,
        user_id: int,
        inv_type: str,
        target: str,
        threat_score: Optional[int],
        result_data: Optional[dict],
        status: str = "COMPLETED",
    ) -> Investigation:
        inv = Investigation(
            user_id=user_id,
            type=inv_type,
            target=target,
            status=status,
            threat_score=threat_score,
            result_data=result_data,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        return inv

    # ------------------------------------------------------------------ #
    #  READ                                                                #
    # ------------------------------------------------------------------ #

    def get_by_id(self, db: Session, investigation_id: str, user_id: int) -> Optional[Investigation]:
        return (
            db.query(Investigation)
            .filter(
                Investigation.id == investigation_id,
                Investigation.user_id == user_id,
                Investigation.is_deleted == False,
            )
            .first()
        )

    def get_user_investigations(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        inv_type: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc",
        is_favorite: Optional[bool] = None,
        is_archived: Optional[bool] = False,
    ) -> tuple[list[Investigation], int]:
        """Returns (items, total_count) for pagination."""
        query = db.query(Investigation).filter(
            Investigation.user_id == user_id,
            Investigation.is_deleted == False,
        )
        if inv_type:
            query = query.filter(Investigation.type == inv_type.upper())
        if status:
            query = query.filter(Investigation.status == status.upper())
        if search:
            query = query.filter(
                (Investigation.target.ilike(f"%{search}%")) |
                (Investigation.name.ilike(f"%{search}%"))
            )
        if is_favorite is not None:
            query = query.filter(Investigation.is_favorite == is_favorite)
        if is_archived is not None:
            query = query.filter(Investigation.is_archived == is_archived)

        total = query.count()
        
        # Sorting
        sort_column = getattr(Investigation, sort_by, Investigation.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
            
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_recent(self, db: Session, user_id: int, limit: int = 10) -> list[Investigation]:
        return (
            db.query(Investigation)
            .filter(
                Investigation.user_id == user_id,
                Investigation.is_deleted == False,
            )
            .order_by(Investigation.created_at.desc())
            .limit(limit)
            .all()
        )

    # ------------------------------------------------------------------ #
    #  UPDATE / DELETE                                                     #
    # ------------------------------------------------------------------ #

    def soft_delete(self, db: Session, investigation_id: str, user_id: int) -> bool:
        """Marks the record as deleted; returns True on success, False if not found."""
        inv = self.get_by_id(db, investigation_id, user_id)
        if not inv:
            return False
        inv.is_deleted = True
        db.commit()
        return True

    def bulk_delete(self, db: Session, investigation_ids: list[str], user_id: int) -> int:
        """Soft deletes multiple investigations. Returns count of deleted rows."""
        result = db.query(Investigation).filter(
            Investigation.id.in_(investigation_ids),
            Investigation.user_id == user_id,
            Investigation.is_deleted == False
        ).update({"is_deleted": True}, synchronize_session=False)
        db.commit()
        return result

    def update(
        self,
        db: Session,
        investigation_id: str,
        user_id: int,
        update_data: dict
    ) -> Optional[Investigation]:
        """Updates metadata fields (name, notes, tags, is_favorite, is_archived)."""
        inv = self.get_by_id(db, investigation_id, user_id)
        if not inv:
            return None

        for key, value in update_data.items():
            if hasattr(inv, key):
                setattr(inv, key, value)
                
        db.commit()
        db.refresh(inv)
        return inv

    # ------------------------------------------------------------------ #
    #  AGGREGATE — Dashboard                                               #
    # ------------------------------------------------------------------ #

    def get_user_stats(self, db: Session, user_id: int) -> dict:
        """
        Returns aggregate investigation counts for the dashboard stat cards.
        Threat-score thresholds match the frontend ThreatGauge logic:
          > 75 → malicious, > 40 → suspicious, else safe
        """
        rows = (
            db.query(
                func.count(Investigation.id).label("total"),
                func.sum(
                    case((Investigation.threat_score > 75, 1), else_=0)
                ).label("malicious"),
                func.sum(
                    case((Investigation.threat_score <= 40, 1), else_=0)
                ).label("safe"),
                func.sum(
                    case(
                        (and_(Investigation.threat_score > 40, Investigation.threat_score <= 75), 1),
                        else_=0,
                    )
                ).label("suspicious"),
                func.avg(Investigation.threat_score).label("average_score"),
            )
            .filter(
                Investigation.user_id == user_id,
                Investigation.is_deleted == False,
                Investigation.status == "COMPLETED",
            )
            .one()
        )
        return {
            "total": int(rows.total or 0),
            "malicious": int(rows.malicious or 0),
            "safe": int(rows.safe or 0),
            "suspicious": int(rows.suspicious or 0),
            "average_score": float(rows.average_score or 0.0),
            "pending": db.query(func.count(Investigation.id))
            .filter(
                Investigation.user_id == user_id,
                Investigation.status == "PENDING",
                Investigation.is_deleted == False,
            )
            .scalar() or 0,
        }

    def get_weekly_activity(self, db: Session, user_id: int) -> list[dict]:
        """
        Returns the last 7 days of per-day malicious / safe counts.
        Day names are abbreviated (Mon, Tue …) to match the chart data format.
        """
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        result = []
        today = datetime.now(timezone.utc).date()

        for i in range(6, -1, -1):  # oldest → newest
            target_date = today - timedelta(days=i)
            start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=timezone.utc)
            end = start + timedelta(days=1)

            rows = (
                db.query(
                    func.sum(case((Investigation.threat_score > 75, 1), else_=0)).label("malicious"),
                    func.sum(case((Investigation.threat_score <= 40, 1), else_=0)).label("safe"),
                )
                .filter(
                    Investigation.user_id == user_id,
                    Investigation.is_deleted == False,
                    Investigation.status == "COMPLETED",
                    Investigation.created_at >= start,
                    Investigation.created_at < end,
                )
                .one()
            )
            result.append(
                {
                    "name": day_names[target_date.weekday()],
                    "malicious": int(rows.malicious or 0),
                    "safe": int(rows.safe or 0),
                }
            )
        return result

    def get_type_distribution(self, db: Session, user_id: int) -> list[dict]:
        """Returns count per investigation type for pie/bar charts."""
        rows = (
            db.query(Investigation.type, func.count(Investigation.id).label("count"))
            .filter(
                Investigation.user_id == user_id,
                Investigation.is_deleted == False,
                Investigation.status == "COMPLETED",
            )
            .group_by(Investigation.type)
            .all()
        )
        return [{"name": r.type, "value": r.count} for r in rows]

    def get_risk_distribution(self, db: Session, user_id: int) -> list[dict]:
        """Returns count of malicious, suspicious, and safe investigations."""
        stats = self.get_user_stats(db, user_id)
        return [
            {"name": "Malicious", "value": stats["malicious"]},
            {"name": "Suspicious", "value": stats["suspicious"]},
            {"name": "Safe", "value": stats["safe"]}
        ]

    def get_top_targets(self, db: Session, user_id: int, limit: int = 5) -> list[dict]:
        """Returns the most frequently investigated targets."""
        rows = (
            db.query(Investigation.target, func.count(Investigation.id).label("count"))
            .filter(
                Investigation.user_id == user_id,
                Investigation.is_deleted == False,
                Investigation.status == "COMPLETED",
            )
            .group_by(Investigation.target)
            .order_by(func.count(Investigation.id).desc())
            .limit(limit)
            .all()
        )
        return [{"target": r.target, "count": r.count} for r in rows]

    def get_analyst_productivity(self, db: Session, user_id: int) -> list[dict]:
        """Returns investigations per day over the last 30 days."""
        result = []
        today = datetime.now(timezone.utc).date()
        for i in range(29, -1, -1):
            target_date = today - timedelta(days=i)
            start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=timezone.utc)
            end = start + timedelta(days=1)
            count = (
                db.query(func.count(Investigation.id))
                .filter(
                    Investigation.user_id == user_id,
                    Investigation.is_deleted == False,
                    Investigation.created_at >= start,
                    Investigation.created_at < end,
                )
                .scalar()
            )
            result.append({
                "date": target_date.strftime("%b %d"),
                "count": count or 0
            })
    def get_iocs(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        ioc_type: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "last_seen",
        sort_order: Optional[str] = "desc"
    ) -> tuple[list[dict], int]:
        """Groups investigations by target to form IOCs."""
        query = (
            db.query(
                Investigation.target,
                func.max(Investigation.type).label("type"),
                func.count(Investigation.id).label("occurrence_count"),
                func.min(Investigation.created_at).label("first_seen"),
                func.max(Investigation.created_at).label("last_seen"),
                func.max(Investigation.threat_score).label("max_threat_score")
            )
            .filter(
                Investigation.user_id == user_id,
                Investigation.is_deleted == False,
                Investigation.status == "COMPLETED"
            )
        )
        
        if ioc_type:
            query = query.filter(Investigation.type == ioc_type.upper())
        if search:
            query = query.filter(Investigation.target.ilike(f"%{search}%"))
            
        query = query.group_by(Investigation.target)
        
        total = query.count()
        
        if sort_by == "occurrence_count":
            sort_col = func.count(Investigation.id)
        elif sort_by == "threat_score":
            sort_col = func.max(Investigation.threat_score)
        elif sort_by == "first_seen":
            sort_col = func.min(Investigation.created_at)
        else:
            sort_col = func.max(Investigation.created_at)
            
        if sort_order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())
            
        items = query.offset(skip).limit(limit).all()
        
        results = [{
            "target": r.target,
            "type": r.type,
            "occurrence_count": r.occurrence_count,
            "first_seen": r.first_seen,
            "last_seen": r.last_seen,
            "max_threat_score": r.max_threat_score
        } for r in items]
        
        return results, total

    def get_ioc_details(self, db: Session, user_id: int, target: str) -> dict:
        """Fetches the IOC summary and linked investigations for a specific target."""
        row = (
            db.query(
                Investigation.target,
                func.max(Investigation.type).label("type"),
                func.count(Investigation.id).label("occurrence_count"),
                func.min(Investigation.created_at).label("first_seen"),
                func.max(Investigation.created_at).label("last_seen"),
                func.max(Investigation.threat_score).label("max_threat_score")
            )
            .filter(
                Investigation.user_id == user_id,
                Investigation.target == target,
                Investigation.is_deleted == False,
                Investigation.status == "COMPLETED"
            )
            .group_by(Investigation.target)
            .first()
        )
        if not row:
            return None
            
        ioc_summary = {
            "target": row.target,
            "type": row.type,
            "occurrence_count": row.occurrence_count,
            "first_seen": row.first_seen,
            "last_seen": row.last_seen,
            "max_threat_score": row.max_threat_score
        }
        
        investigations = (
            db.query(Investigation)
            .filter(
                Investigation.user_id == user_id,
                Investigation.target == target,
                Investigation.is_deleted == False,
                Investigation.status == "COMPLETED"
            )
            .order_by(Investigation.created_at.desc())
            .all()
        )
        
        return {
            "ioc": ioc_summary,
            "investigations": investigations
        }

investigation_repository = InvestigationRepository()
