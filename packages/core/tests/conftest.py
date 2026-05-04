"""Shared fixtures for all test layers."""

from __future__ import annotations

import uuid
from datetime import date

import pytest

from openrun.models import Athlete
from openrun.race import load_race


@pytest.fixture
def athlete_vdot_45() -> Athlete:
    return Athlete(
        id=uuid.uuid4(),
        age=35,
        resting_hr=55,
        max_hr=185,
        vdot=45.0,
        weekly_mileage=40.0,
    )


@pytest.fixture
def athlete_vdot_50() -> Athlete:
    return Athlete(
        id=uuid.uuid4(),
        age=32,
        resting_hr=50,
        max_hr=190,
        vdot=50.0,
        weekly_mileage=50.0,
    )


@pytest.fixture
def tcm_2026():
    return load_race("tcm-2026")


@pytest.fixture
def sample_training_history() -> list[float]:
    """14 days alternating moderate effort and rest."""
    return [60.0, 0.0, 80.0, 0.0, 60.0, 0.0, 100.0, 0.0, 60.0, 0.0, 80.0, 0.0, 60.0, 0.0]


@pytest.fixture
def ctx() -> dict:
    """Mutable context bag threaded through BDD step functions."""
    return {}


@pytest.fixture
def daniels_table() -> list[dict]:
    """Formula-computed golden VDOT → race-time pairs with 5% tolerance."""
    return [
        {"vdot": 45.0, "distance_km": 42.195, "expected_seconds": 12444, "tolerance": 0.05},
        {"vdot": 50.0, "distance_km": 42.195, "expected_seconds": 11400, "tolerance": 0.05},
        {"vdot": 55.0, "distance_km": 42.195, "expected_seconds": 10500, "tolerance": 0.05},
        {"vdot": 60.0, "distance_km": 42.195, "expected_seconds": 9780, "tolerance": 0.05},
        {"vdot": 45.0, "distance_km": 5.0, "expected_seconds": 1270, "tolerance": 0.05},
        {"vdot": 50.0, "distance_km": 5.0, "expected_seconds": 1200, "tolerance": 0.05},
    ]
