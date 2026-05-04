"""Unit tests for openrun.pace."""

from __future__ import annotations

import math

import pytest

from openrun.pace import (
    format_pace,
    format_time,
    hms_to_seconds,
    km_to_miles,
    m_per_min_to_sec_per_km,
    miles_to_km,
    sec_per_km_to_m_per_min,
    sec_per_km_to_sec_per_mile,
    sec_per_mile_to_sec_per_km,
)

_KM_PER_MILE = 1.609344


class TestPaceVelocityConversion:
    def test_roundtrip_sec_per_km_to_m_per_min(self) -> None:
        pace = 300.0  # 5:00/km
        assert math.isclose(m_per_min_to_sec_per_km(sec_per_km_to_m_per_min(pace)), pace)

    def test_5min_per_km_is_200_m_per_min(self) -> None:
        assert math.isclose(sec_per_km_to_m_per_min(300.0), 200.0)

    def test_200_m_per_min_is_5min_per_km(self) -> None:
        assert math.isclose(m_per_min_to_sec_per_km(200.0), 300.0)

    def test_zero_pace_raises(self) -> None:
        with pytest.raises(ValueError):
            sec_per_km_to_m_per_min(0.0)

    def test_zero_velocity_raises(self) -> None:
        with pytest.raises(ValueError):
            m_per_min_to_sec_per_km(0.0)

    def test_negative_pace_raises(self) -> None:
        with pytest.raises(ValueError):
            sec_per_km_to_m_per_min(-1.0)


class TestMileConversions:
    def test_sec_per_km_to_sec_per_mile(self) -> None:
        result = sec_per_km_to_sec_per_mile(60.0)
        assert math.isclose(result, 60.0 * _KM_PER_MILE, rel_tol=1e-6)

    def test_sec_per_mile_to_sec_per_km(self) -> None:
        result = sec_per_mile_to_sec_per_km(60.0 * _KM_PER_MILE)
        assert math.isclose(result, 60.0, rel_tol=1e-6)

    def test_km_to_miles_roundtrip(self) -> None:
        assert math.isclose(miles_to_km(km_to_miles(42.195)), 42.195, rel_tol=1e-6)

    def test_one_mile_in_km(self) -> None:
        assert math.isclose(miles_to_km(1.0), _KM_PER_MILE, rel_tol=1e-6)

    def test_one_km_in_miles(self) -> None:
        assert math.isclose(km_to_miles(1.0), 1.0 / _KM_PER_MILE, rel_tol=1e-6)


class TestFormatPace:
    @pytest.mark.parametrize("sec_per_km,expected", [
        (300.0, "5:00"),
        (360.0, "6:00"),
        (270.0, "4:30"),
        (305.0, "5:05"),
        (59.0, "0:59"),
    ])
    def test_format_known_paces(self, sec_per_km: float, expected: str) -> None:
        assert format_pace(sec_per_km) == expected


class TestFormatTime:
    @pytest.mark.parametrize("total_seconds,expected", [
        (3600, "1:00:00"),
        (3661, "1:01:01"),
        (7200, "2:00:00"),
        (5400, "1:30:00"),
        (12444, "3:27:24"),
        (0, "0:00:00"),
    ])
    def test_format_known_times(self, total_seconds: int, expected: str) -> None:
        assert format_time(total_seconds) == expected


class TestHmsToSeconds:
    def test_one_hour(self) -> None:
        assert hms_to_seconds(1, 0, 0) == 3600

    def test_marathon_time(self) -> None:
        assert hms_to_seconds(3, 27, 24) == 12444

    def test_zero(self) -> None:
        assert hms_to_seconds(0, 0, 0) == 0

    def test_mixed(self) -> None:
        assert hms_to_seconds(0, 20, 30) == 1230
