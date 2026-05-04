"""Regression tests: formula output must not drift from golden values.

If a formula change is intentional, update daniels_table.json to the new values
and document the change in the commit message.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from openrun.vdot import calculate_vdot, predict_race_time

_GOLDEN = json.loads((Path(__file__).parent / "daniels_table.json").read_text())


@pytest.mark.parametrize(
    "entry",
    _GOLDEN["vdot_to_race_time"],
    ids=[
        f"VDOT{e['vdot']}_d{e['distance_km']}km" for e in _GOLDEN["vdot_to_race_time"]
    ],
)
def test_predict_race_time_matches_golden(entry: dict) -> None:
    result = predict_race_time(entry["vdot"], entry["distance_km"])
    expected = entry["expected_seconds"]
    tol = entry["tolerance"]
    assert abs(result - expected) / expected <= tol, (
        f"predict_race_time(VDOT={entry['vdot']}, d={entry['distance_km']}km) = {result}s; "
        f"golden={expected}s; drift={abs(result - expected) / expected:.1%} > {tol:.0%}"
    )


@pytest.mark.parametrize(
    "entry",
    _GOLDEN["race_to_vdot"],
    ids=[
        f"d{e['distance_km']}km_t{e['time_seconds']}s" for e in _GOLDEN["race_to_vdot"]
    ],
)
def test_calculate_vdot_matches_golden(entry: dict) -> None:
    result = calculate_vdot(entry["distance_km"], float(entry["time_seconds"]))
    expected = entry["expected_vdot"]
    tol = entry["tolerance"]
    assert abs(result - expected) / expected <= tol, (
        f"calculate_vdot(d={entry['distance_km']}km, t={entry['time_seconds']}s) = {result:.2f}; "
        f"golden={expected}; drift={abs(result - expected) / expected:.1%} > {tol:.0%}"
    )
