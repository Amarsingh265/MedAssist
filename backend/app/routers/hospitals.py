import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])


def _distance_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


@router.get("", response_model=list[schemas.HospitalOut])
def list_hospitals(
    city: Optional[str] = None,
    search: Optional[str] = Query(None, max_length=100),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Hospital)
    if city:
        q = q.filter(models.Hospital.city.ilike(f"%{city}%"))
    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.filter(or_(
            models.Hospital.name.ilike(term),
            models.Hospital.city.ilike(term),
            models.Hospital.address.ilike(term),
            models.Hospital.specialties.ilike(term),
        ))
    hospitals = q.all()

    if lat is not None and lon is not None:
        hospitals = sorted(
            hospitals,
            key=lambda h: _distance_km(lat, lon, h.latitude, h.longitude) or 999999,
        )
    return hospitals
