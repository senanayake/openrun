"""Property-based tests for openrun.pace conversion invariants."""

from __future__ import annotations

import math

from hypothesis import given, settings
from hypothesis import strategies as st

from openrun.pace import (
    format_pace,
    format_time,
    km_to_miles,
    m_per_min_to_sec_per_km,
    miles_to_km,
    sec_per_km_to_m_per_min,
    sec_per_km_to_sec_per_mile,
    sec_per_mile_to_sec_per_km,
)

_POSITIVE_FLOAT = st.floats(min_value=0.01, max_value=10000.0, allow_nan=False, allow_infinity=False)
_PACE = st.floats(min_value=60.0, max_value=1200.0, allow_nan=False, allow_infinity=False)
_NONNEG_INT = st.integers(min_value=0, max_value=359999)  # up to 100 hours


@given(_PACE)
@settings(max_examples=200)
def test_sec_per_km_m_per_min_roundtrip(pace: float) -> None:
    assert math.isclose(m_per_min_to_sec_per_km(sec_per_km_to_m_per_min(pace)), pace, rel_tol=1e-9)


@given(_PACE)
@settings(max_examples=200)
def test_sec_per_km_to_mile_roundtrip(pace: float) -> None:
    assert math.isclose(sec_per_mile_to_sec_per_km(sec_per_km_to_sec_per_mile(pace)), pace, rel_tol=1e-9)


@given(_POSITIVE_FLOAT)
@settings(max_examples=200)
def test_km_miles_roundtrip(km: float) -> None:
    assert math.isclose(miles_to_km(km_to_miles(km)), km, rel_tol=1e-9)


@given(_PACE)
@settings(max_examples=100)
def test_format_pace_contains_colon(pace: float) -> None:
    result = format_pace(pace)
    assert ":" in result


@given(_PACE)
@settings(max_examples=100)
def test_format_pace_seconds_part_two_digits(pace: float) -> None:
    result = format_pace(pace)
    seconds_part = result.split(":")[1]
    assert len(seconds_part) == 2


@given(_NONNEG_INT)
@settings(max_examples=100)
def test_format_time_hms_structure(total_seconds: int) -> None:
    result = format_time(total_seconds)
    parts = result.split(":")
    assert len(parts) == 3
    assert len(parts[1]) == 2  # MM
    assert len(parts[2]) == 2  # SS


@given(_POSITIVE_FLOAT)
@settings(max_examples=200)
def test_km_to_miles_always_shorter(km: float) -> None:
    assert km_to_miles(km) < km


@given(_POSITIVE_FLOAT)
@settings(max_examples=200)
def test_miles_to_km_always_longer(miles: float) -> None:
    assert miles_to_km(miles) > miles
