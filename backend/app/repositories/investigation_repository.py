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
            query = query.filter(Investigation.target.ilike(f"%{search}%"))

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
        return [{"type": r.type, "count": r.count} for r in rows]


investigation_repository = InvestigationRepository()
