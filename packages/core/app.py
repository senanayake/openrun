"""FastAPI server exposing packages/core coaching engine over HTTP.

Run: uvicorn app:app --port 8001 --reload
"""

from __future__ import annotations

import json
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openrun.models import TrainingPhase, TrainingPlan
from openrun.periodization import build_periodization_plan
from openrun.race import generate_pace_bands, load_race
from openrun.training_load import assess_readiness, build_load_history, calculate_tss
from openrun.vdot import (
    InvalidRaceInputError,
    InvalidVDOTError,
    calculate_vdot,
    generate_training_paces,
    predict_race_time,
)

app = FastAPI(title="OpenRun Core API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_DATA_DIR = Path(__file__).parent / "data" / "races"


# ── Request / response models ─────────────────────────────────────────────────

class VdotRequest(BaseModel):
    distance_km: float
    time_seconds: int


class PaceZoneSchema(BaseModel):
    zone: int
    name: str
    min_pace_sec_per_km: float
    max_pace_sec_per_km: float
    color: str


class VdotResponse(BaseModel):
    vdot: float
    vo2max: float
    marathon_seconds: int
    half_marathon_seconds: int
    k10_seconds: int
    k5_seconds: int
    pace_zones: list[PaceZoneSchema]


class PlanRequest(BaseModel):
    race_id: str
    race_date: str          # ISO date string
    start_date: str         # ISO date string
    current_vdot: float
    current_weekly_mileage: float
    athlete_id: str | None = None


class TssRequest(BaseModel):
    duration_seconds: int
    avg_pace_sec_per_km: float
    ftp_sec_per_km: float
    elevation_gain_m: float = 0.0
    distance_km: float = 0.0


class TssResponse(BaseModel):
    tss: float


class LoadHistoryRequest(BaseModel):
    daily_tss: list[float]
    start_date: str
    initial_ctl: float = 0.0
    initial_atl: float = 0.0


# ── Helpers ──────────────────────────────────────────────────────────────────

def _pace_to_zone(pace_sec_per_km: float, vdot: float) -> int:
    """Approximate HR zone from pace relative to VDOT paces."""
    try:
        paces = generate_training_paces(vdot)
    except InvalidVDOTError:
        return 3
    if pace_sec_per_km >= paces.easy_upper_sec_per_km:
        return 1
    if pace_sec_per_km >= paces.easy_lower_sec_per_km:
        return 2
    if pace_sec_per_km >= paces.marathon_sec_per_km:
        return 3
    if pace_sec_per_km >= paces.threshold_sec_per_km:
        return 4
    return 5


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "0.1.0"}


@app.post("/vdot", response_model=VdotResponse)
def vdot_endpoint(req: VdotRequest) -> VdotResponse:
    try:
        vdot = calculate_vdot(req.distance_km, float(req.time_seconds))
    except InvalidRaceInputError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    try:
        paces = generate_training_paces(vdot)
    except InvalidVDOTError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    marathon_secs = predict_race_time(vdot, 42.195)
    half_secs = predict_race_time(vdot, 21.0975)
    k10_secs = predict_race_time(vdot, 10.0)
    k5_secs = predict_race_time(vdot, 5.0)

    # Build 5 pace zones from training paces
    # min_pace = fastest (lower sec/km), max_pace = slowest (higher sec/km)
    zones = [
        PaceZoneSchema(zone=1, name="Recovery",
                       min_pace_sec_per_km=round(paces.easy_upper_sec_per_km, 1),
                       max_pace_sec_per_km=round(paces.easy_upper_sec_per_km + 30, 1),
                       color="#3b82f6"),
        PaceZoneSchema(zone=2, name="Aerobic",
                       min_pace_sec_per_km=round(paces.easy_lower_sec_per_km, 1),
                       max_pace_sec_per_km=round(paces.easy_upper_sec_per_km, 1),
                       color="#10b981"),
        PaceZoneSchema(zone=3, name="Tempo / MP",
                       min_pace_sec_per_km=round(paces.marathon_sec_per_km, 1),
                       max_pace_sec_per_km=round(paces.easy_lower_sec_per_km, 1),
                       color="#f59e0b"),
        PaceZoneSchema(zone=4, name="Threshold",
                       min_pace_sec_per_km=round(paces.threshold_sec_per_km, 1),
                       max_pace_sec_per_km=round(paces.marathon_sec_per_km, 1),
                       color="#f97316"),
        PaceZoneSchema(zone=5, name="VO₂max",
                       min_pace_sec_per_km=round(paces.interval_sec_per_km, 1),
                       max_pace_sec_per_km=round(paces.threshold_sec_per_km, 1),
                       color="#ef4444"),
    ]

    return VdotResponse(
        vdot=round(vdot, 2),
        vo2max=round(vdot, 2),
        marathon_seconds=marathon_secs,
        half_marathon_seconds=half_secs,
        k10_seconds=k10_secs,
        k5_seconds=k5_secs,
        pace_zones=zones,
    )


@app.post("/plans")
def generate_plan_endpoint(req: PlanRequest) -> dict[str, Any]:
    try:
        race_date = date.fromisoformat(req.race_date)
        start_date = date.fromisoformat(req.start_date)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid date: {e}") from e

    athlete_id = uuid.UUID(req.athlete_id) if req.athlete_id else uuid.uuid4()

    try:
        plan = build_periodization_plan(
            race_date=race_date,
            current_date=start_date,
            current_weekly_mileage=req.current_weekly_mileage,
            athlete_id=athlete_id,
            race_id=req.race_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    return {
        "id": str(plan.id),
        "athlete_id": str(plan.athlete_id),
        "race_id": plan.race_id,
        "race_date": plan.race_date.isoformat(),
        "created_at": plan.created_at.isoformat(),
        "weeks": [
            {
                "week_number": w.week_number,
                "phase": w.phase.value,
                "target_mileage": w.target_mileage,
                "is_recovery_week": w.is_recovery_week,
                "key_workouts": w.key_workouts,
            }
            for w in plan.weeks
        ],
    }


@app.post("/tss", response_model=TssResponse)
def tss_endpoint(req: TssRequest) -> TssResponse:
    try:
        tss = calculate_tss(
            duration_seconds=req.duration_seconds,
            avg_pace_sec_per_km=req.avg_pace_sec_per_km,
            ftp_sec_per_km=req.ftp_sec_per_km,
            elevation_gain_m=req.elevation_gain_m,
            distance_km=req.distance_km,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return TssResponse(tss=round(tss, 2))


@app.get("/races")
def list_races() -> list[dict[str, Any]]:
    races = []
    for path in _DATA_DIR.glob("*.json"):
        data: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
        races.append({
            "id": data["id"],
            "name": data["name"],
            "date": data["date"],
            "distance_km": data["distance_km"],
            "course_type": data["course_type"],
            "bq_qualifier": data["bq_qualifier"],
            "course_difficulty_rating": data.get("course_difficulty_rating", "moderate"),
            "start": data.get("start"),
            "finish": data.get("finish"),
        })
    return races


@app.get("/races/{race_id}")
def get_race(race_id: str) -> dict[str, Any]:
    for path in _DATA_DIR.glob("*.json"):
        data: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
        if data.get("id") == race_id:
            return data
    raise HTTPException(status_code=404, detail=f"Race '{race_id}' not found")


@app.get("/races/{race_id}/pace-bands")
def pace_bands_endpoint(
    race_id: str,
    goal_time_seconds: int = Query(..., gt=0),
) -> dict[str, Any]:
    try:
        race = load_race(race_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    # Derive VDOT from goal time
    try:
        goal_vdot = calculate_vdot(race.distance_km, float(goal_time_seconds))
    except InvalidRaceInputError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    base_bands = generate_pace_bands(goal_vdot, race, splits=len(race.segments))

    KM_PER_MILE = 1.60934

    def band_dict(b: Any) -> dict[str, Any]:
        return {
            "label": b.segment_name,
            "start_km": round(b.mile_start * KM_PER_MILE, 1),
            "end_km": round(b.mile_end * KM_PER_MILE, 1),
            "target_pace_sec_per_km": round(b.target_pace_sec_per_km, 1),
            "zone": _pace_to_zone(b.target_pace_sec_per_km, goal_vdot),
            "note": b.adjustment_reason,
        }

    return {"bands": [band_dict(b) for b in base_bands]}


@app.post("/load-history")
def load_history_endpoint(req: LoadHistoryRequest) -> dict[str, Any]:
    try:
        start = date.fromisoformat(req.start_date)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    history = build_load_history(
        req.daily_tss, start, req.initial_ctl, req.initial_atl
    )
    return {
        "snapshots": [
            {
                "date": s.date.isoformat(),
                "ctl": s.ctl,
                "atl": s.atl,
                "tsb": s.tsb,
            }
            for s in history
        ]
    }


@app.get("/readiness")
def readiness_endpoint(ctl: float = Query(...), atl: float = Query(...)) -> dict[str, Any]:
    warnings = assess_readiness(ctl, atl)
    return {
        "tsb": round(ctl - atl, 2),
        "warnings": [
            {"code": w.code, "message": w.message, "severity": w.severity}
            for w in warnings
        ],
    }
