"""Race data model and course-adjusted time prediction."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from openrun.vdot import predict_race_time

_DATA_DIR = Path(__file__).parent.parent.parent / "data" / "races"


@dataclass
class ElevationPoint:
    mile: float
    elevation_ft: float
    grade_pct: float = 0.0
    segment_note: str = ""


@dataclass
class Segment:
    name: str
    mile_start: float
    mile_end: float
    difficulty: str
    strategy: str


@dataclass
class Race:
    id: str
    name: str
    distance_km: float
    elevation_gain_m: float
    elevation_loss_m: float
    elevation_adjustment_factor: float
    course_type: str
    bq_qualifier: bool
    elevation_profile: list[ElevationPoint]
    segments: list[Segment]
    notes: str = ""


@dataclass
class PaceBand:
    segment_name: str
    mile_start: float
    mile_end: float
    target_pace_sec_per_km: float
    adjustment_reason: str = ""


def load_race(race_id: str) -> Race:
    """Load race data from the data/races/ directory by ID.

    Args:
        race_id: The race ID matching the ``id`` field in the JSON file.

    Raises:
        FileNotFoundError: If no matching race file is found.
        ValueError: If the JSON is malformed or missing required fields.
    """
    for path in _DATA_DIR.glob("*.json"):
        data: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
        if data.get("id") == race_id:
            return _parse_race(data)
    raise FileNotFoundError(f"No race found with id '{race_id}' in {_DATA_DIR}")


def _parse_race(data: dict[str, Any]) -> Race:
    profile = [
        ElevationPoint(
            mile=p["mile"],
            elevation_ft=p["elevation_ft"],
            grade_pct=p.get("grade_pct", 0.0),
            segment_note=p.get("segment_note", ""),
        )
        for p in data.get("elevation_profile", [])
    ]
    segments = [
        Segment(
            name=s["name"],
            mile_start=s["mile_start"],
            mile_end=s["mile_end"],
            difficulty=s["difficulty"],
            strategy=s["strategy"],
        )
        for s in data.get("segments", [])
    ]
    return Race(
        id=data["id"],
        name=data["name"],
        distance_km=data["distance_km"],
        elevation_gain_m=data["elevation_gain_m"],
        elevation_loss_m=data["elevation_loss_m"],
        elevation_adjustment_factor=data.get("elevation_adjustment_factor", 1.0),
        course_type=data["course_type"],
        bq_qualifier=data["bq_qualifier"],
        elevation_profile=profile,
        segments=segments,
        notes=data.get("notes", ""),
    )


def calculate_course_adjustment_factor(race: Race) -> float:
    """Return the factor by which flat VDOT prediction should be scaled.

    Values > 1.0 mean the course is harder than flat (slower time expected).
    """
    return race.elevation_adjustment_factor


def predict_course_time(vdot: float, race: Race) -> int:
    """Predict course-adjusted finish time in seconds.

    Applies the race's elevation adjustment factor to the flat VDOT prediction.
    """
    flat_time = predict_race_time(vdot, race.distance_km)
    factor = calculate_course_adjustment_factor(race)
    return round(flat_time * factor)


def generate_pace_bands(vdot: float, race: Race, splits: int = 5) -> list[PaceBand]:
    """Generate recommended pace for each course segment.

    Adjusts base marathon pace for segment difficulty and grade.
    """
    from openrun.vdot import generate_training_paces

    paces = generate_training_paces(vdot)
    base_pace = paces.marathon_sec_per_km
    bands = []

    target_segments = race.segments[:splits] if splits <= len(race.segments) else race.segments

    for seg in target_segments:
        if seg.difficulty == "easy":
            adjusted = base_pace * 1.00
            reason = "flat / easy — hold marathon pace"
        elif seg.difficulty == "moderate":
            adjusted = base_pace * 1.03
            reason = "moderate terrain — 3% slower by effort"
        elif seg.difficulty == "hard":
            adjusted = base_pace * 1.08
            reason = "hard climb — 8% slower by effort, shorten stride"
        else:  # very_hard
            adjusted = base_pace * 1.12
            reason = "very hard — 12% slower by effort, survive"

        bands.append(
            PaceBand(
                segment_name=seg.name,
                mile_start=seg.mile_start,
                mile_end=seg.mile_end,
                target_pace_sec_per_km=adjusted,
                adjustment_reason=reason,
            )
        )

    return bands


def identify_critical_segments(race: Race) -> list[Segment]:
    """Return segments requiring special pacing attention.

    Flags: difficulty == 'hard' or 'very_hard', or segments with trap notes.
    """
    critical = []
    trap_keywords = {"trap", "shock", "recovery opportunity", "race starts"}
    for seg in race.segments:
        if seg.difficulty in ("hard", "very_hard"):
            critical.append(seg)
        elif any(kw in seg.strategy.lower() for kw in trap_keywords):
            critical.append(seg)
    return critical
