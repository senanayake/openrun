"""Unit tests for openrun.vdot."""

from __future__ import annotations

import math

import pytest

from openrun.vdot import (
    InvalidRaceInputError,
    InvalidVDOTError,
    _pct_vo2max,
    _velocity_for_vo2_fraction,
    _vo2_at_velocity,
    calculate_vdot,
    generate_training_paces,
    predict_race_time,
)


class TestVo2AtVelocity:
    def test_zero_velocity_produces_negative_vo2(self) -> None:
        assert _vo2_at_velocity(0.0) < 0

    def test_increases_with_velocity(self) -> None:
        assert _vo2_at_velocity(300.0) > _vo2_at_velocity(200.0)

    def test_known_value_250_m_per_min(self) -> None:
        # v=250: -4.60 + 0.182258*250 + 0.000104*62500
        expected = -4.60 + 0.182258 * 250 + 0.000104 * 62500
        assert math.isclose(_vo2_at_velocity(250.0), expected, rel_tol=1e-9)


class TestPctVo2Max:
    def test_short_race_fraction_near_one(self) -> None:
        # Sub-5 min effort — fraction should be close to 1.0
        assert _pct_vo2max(4.0) > 0.95

    def test_long_race_fraction_lower(self) -> None:
        # 4-hour effort
        assert _pct_vo2max(240.0) < 0.85

    def test_fraction_decreases_with_duration(self) -> None:
        assert _pct_vo2max(30.0) > _pct_vo2max(120.0)

    def test_always_positive(self) -> None:
        for t in [5, 20, 60, 180, 300]:
            assert _pct_vo2max(float(t)) > 0


class TestVelocityForVo2Fraction:
    def test_higher_pct_means_faster_velocity(self) -> None:
        v_high = _velocity_for_vo2_fraction(50.0, 0.99)
        v_low = _velocity_for_vo2_fraction(50.0, 0.70)
        assert v_high > v_low

    def test_inverse_of_vo2_at_velocity(self) -> None:
        vdot = 50.0
        pct = 0.85
        v = _velocity_for_vo2_fraction(vdot, pct)
        assert math.isclose(_vo2_at_velocity(v), vdot * pct, rel_tol=1e-4)


class TestCalculateVdot:
    @pytest.mark.parametrize(
        "distance_km, time_s, expected_vdot, tol",
        [
            (5.0, 1200.0, 49.8, 0.02),    # 5K in 20:00
            (42.195, 12600.0, 44.5, 0.03), # marathon in 3:30
            (10.0, 2520.0, 49.1, 0.03),    # 10K in 42:00
        ],
    )
    def test_known_performances(
        self, distance_km: float, time_s: float, expected_vdot: float, tol: float
    ) -> None:
        result = calculate_vdot(distance_km, time_s)
        assert abs(result - expected_vdot) / expected_vdot <= tol

    def test_zero_distance_raises(self) -> None:
        with pytest.raises(InvalidRaceInputError):
            calculate_vdot(0.0, 3600.0)

    def test_negative_distance_raises(self) -> None:
        with pytest.raises(InvalidRaceInputError):
            calculate_vdot(-5.0, 1200.0)

    def test_zero_time_raises(self) -> None:
        with pytest.raises(InvalidRaceInputError):
            calculate_vdot(5.0, 0.0)

    def test_implausibly_slow_pace_raises(self) -> None:
        # Walking pace: 5K in 5 hours — VO2 at that velocity → near-zero VDOT
        with pytest.raises(InvalidRaceInputError):
            calculate_vdot(5.0, 18000.0)

    def test_faster_time_gives_higher_vdot(self) -> None:
        fast = calculate_vdot(10.0, 2400.0)
        slow = calculate_vdot(10.0, 3000.0)
        assert fast > slow

    def test_longer_duration_at_same_pace_gives_higher_vdot(self) -> None:
        # Same pace per km (6:00/km = 360 s/km), longer race uses a smaller
        # %VO2max (you can sustain it longer), so VDOT = VO2/pct is higher
        short = calculate_vdot(5.0, 5 * 360.0)
        long = calculate_vdot(21.0975, 21.0975 * 360.0)
        assert long > short


class TestPredictRaceTime:
    def test_vdot_45_marathon_plausible(self) -> None:
        t = predict_race_time(45.0, 42.195)
        # Should be roughly 3:20-3:40 (12000-13200 sec)
        assert 12000 <= t <= 13200

    def test_vdot_50_marathon_faster_than_45(self) -> None:
        t45 = predict_race_time(45.0, 42.195)
        t50 = predict_race_time(50.0, 42.195)
        assert t50 < t45

    def test_5k_faster_than_marathon_at_same_vdot(self) -> None:
        t_5k = predict_race_time(50.0, 5.0)
        t_marathon = predict_race_time(50.0, 42.195)
        assert t_5k < t_marathon

    def test_roundtrip_consistency(self) -> None:
        vdot_in = 48.0
        t = predict_race_time(vdot_in, 10.0)
        vdot_back = calculate_vdot(10.0, float(t))
        assert abs(vdot_back - vdot_in) / vdot_in < 0.01

    def test_below_min_vdot_raises(self) -> None:
        with pytest.raises(InvalidVDOTError):
            predict_race_time(15.0, 42.195)

    def test_above_max_vdot_raises(self) -> None:
        with pytest.raises(InvalidVDOTError):
            predict_race_time(90.0, 42.195)


class TestGenerateTrainingPaces:
    def test_pace_ordering_for_vdot_45(self) -> None:
        paces = generate_training_paces(45.0)
        # Higher sec/km = slower
        assert paces.easy_lower_sec_per_km > paces.marathon_sec_per_km
        assert paces.marathon_sec_per_km > paces.threshold_sec_per_km
        assert paces.threshold_sec_per_km > paces.interval_sec_per_km
        assert paces.interval_sec_per_km > paces.repetition_sec_per_km

    def test_vdot_stored_on_result(self) -> None:
        paces = generate_training_paces(50.0)
        assert paces.vdot == 50.0

    def test_higher_vdot_yields_faster_paces(self) -> None:
        p45 = generate_training_paces(45.0)
        p55 = generate_training_paces(55.0)
        assert p55.marathon_sec_per_km < p45.marathon_sec_per_km

    def test_below_minimum_raises(self) -> None:
        with pytest.raises(InvalidVDOTError):
            generate_training_paces(19.0)

    def test_above_maximum_raises(self) -> None:
        with pytest.raises(InvalidVDOTError):
            generate_training_paces(86.0)
