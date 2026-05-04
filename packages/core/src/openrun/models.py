"""Pydantic v2 data models for the OpenRun coaching engine."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, field_validator, model_validator


class Athlete(BaseModel):
    id: UUID
    age: int
    resting_hr: int
    max_hr: int
    vdot: float
    weekly_mileage: float

    @field_validator("age")
    @classmethod
    def age_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("age must be positive")
        return v

    @field_validator("resting_hr")
    @classmethod
    def resting_hr_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("resting_hr must be positive")
        return v

    @field_validator("max_hr")
    @classmethod
    def max_hr_range(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("max_hr must be positive")
        return v

    @model_validator(mode="after")
    def hr_ordering(self) -> Athlete:
        if self.resting_hr >= self.max_hr:
            raise ValueError("resting_hr must be less than max_hr")
        return self

    @field_validator("vdot")
    @classmethod
    def vdot_range(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("vdot must be positive")
        return v

    @field_validator("weekly_mileage")
    @classmethod
    def mileage_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("weekly_mileage must be non-negative")
        return v


class Workout(BaseModel):
    id: UUID
    athlete_id: UUID
    date: date
    distance_km: float
    duration_seconds: int
    avg_hr: int | None = None
    avg_pace_sec_per_km: float
    elevation_gain_m: float
    tss: float | None = None
    workout_type: Literal["easy", "tempo", "interval", "long", "race", "rest"]

    @field_validator("distance_km")
    @classmethod
    def distance_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("distance_km must be non-negative")
        return v

    @field_validator("duration_seconds")
    @classmethod
    def duration_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("duration_seconds must be positive")
        return v


class TrainingPhase(str, Enum):
    BASE = "base"
    SUPPORT = "support"
    SPECIFIC = "specific"
    TAPER = "taper"


class TrainingWeek(BaseModel):
    week_number: int
    phase: TrainingPhase
    target_mileage: float
    is_recovery_week: bool
    key_workouts: list[str]


class TrainingPlan(BaseModel):
    id: UUID
    athlete_id: UUID
    race_id: str
    race_date: date
    created_at: datetime
    weeks: list[TrainingWeek]


class TrainingPaces(BaseModel):
    vdot: float
    easy_lower_sec_per_km: float
    easy_upper_sec_per_km: float
    marathon_sec_per_km: float
    threshold_sec_per_km: float
    interval_sec_per_km: float
    repetition_sec_per_km: float


class HRZones(BaseModel):
    method: Literal["karvonen", "max_hr_pct"]
    zone1_lower: int
    zone1_upper: int
    zone2_lower: int
    zone2_upper: int
    zone3_lower: int
    zone3_upper: int
    zone4_lower: int
    zone4_upper: int
    zone5_lower: int
    zone5_upper: int


class TrainingLoadSnapshot(BaseModel):
    date: date
    ctl: float
    atl: float
    tsb: float

    @model_validator(mode="after")
    def tsb_is_ctl_minus_atl(self) -> TrainingLoadSnapshot:
        expected = round(self.ctl - self.atl, 6)
        if abs(expected - self.tsb) > 1e-4:
            raise ValueError(f"tsb must equal ctl - atl (expected {expected}, got {self.tsb})")
        return self


class TrainingWarning(BaseModel):
    code: str
    message: str
    severity: Literal["info", "warning", "critical"]
