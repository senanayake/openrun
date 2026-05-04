"""Unit tests for openrun.zones."""

from __future__ import annotations

import pytest

from openrun.zones import (
    InvalidHeartRateError,
    calculate_hr_zones_karvonen,
    calculate_hr_zones_max_pct,
    zone_boundaries,
)


class TestKarvonenZones:
    def test_five_zones_produced(self) -> None:
        zones = calculate_hr_zones_karvonen(185, 55)
        bounds = zone_boundaries(zones)
        assert len(bounds) == 5

    def test_zones_increase_monotonically(self) -> None:
        zones = calculate_hr_zones_karvonen(185, 55)
        bounds = zone_boundaries(zones)
        for i in range(len(bounds) - 1):
            assert bounds[i][1] <= bounds[i + 1][0] + 1  # allow 1 bpm rounding overlap

    def test_zone1_lower_above_resting_hr(self) -> None:
        zones = calculate_hr_zones_karvonen(185, 55)
        assert zones.zone1_lower > 55

    def test_zone5_upper_at_max_hr(self) -> None:
        zones = calculate_hr_zones_karvonen(185, 55)
        assert zones.zone5_upper == 185

    def test_method_is_karvonen(self) -> None:
        zones = calculate_hr_zones_karvonen(185, 55)
        assert zones.method == "karvonen"

    def test_resting_gte_max_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_karvonen(150, 150)

    def test_resting_gt_max_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_karvonen(150, 160)

    def test_zero_max_hr_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_karvonen(0, 55)

    def test_zero_resting_hr_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_karvonen(185, 0)

    @pytest.mark.parametrize("max_hr,resting_hr", [(180, 60), (190, 45), (170, 70)])
    def test_various_hr_inputs(self, max_hr: int, resting_hr: int) -> None:
        zones = calculate_hr_zones_karvonen(max_hr, resting_hr)
        assert zones.zone1_lower < zones.zone5_upper
        assert zones.zone5_upper == max_hr


class TestMaxPctZones:
    def test_five_zones_produced(self) -> None:
        zones = calculate_hr_zones_max_pct(185)
        assert len(zone_boundaries(zones)) == 5

    def test_zone1_lower_is_50_pct_max(self) -> None:
        zones = calculate_hr_zones_max_pct(200)
        assert zones.zone1_lower == 100  # 50% of 200

    def test_zone5_upper_is_max_hr(self) -> None:
        zones = calculate_hr_zones_max_pct(185)
        assert zones.zone5_upper == 185

    def test_method_is_max_hr_pct(self) -> None:
        zones = calculate_hr_zones_max_pct(185)
        assert zones.method == "max_hr_pct"

    def test_zero_max_hr_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_max_pct(0)

    def test_implausibly_low_max_hr_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_max_pct(50)

    def test_implausibly_high_max_hr_raises(self) -> None:
        with pytest.raises(InvalidHeartRateError):
            calculate_hr_zones_max_pct(260)


class TestZoneBoundaries:
    def test_returns_five_tuples(self) -> None:
        zones = calculate_hr_zones_max_pct(185)
        bounds = zone_boundaries(zones)
        assert len(bounds) == 5
        for lower, upper in bounds:
            assert isinstance(lower, int)
            assert isinstance(upper, int)
            assert lower < upper

    def test_karvonen_and_max_pct_different_for_same_max_hr(self) -> None:
        karvonen = calculate_hr_zones_karvonen(185, 55)
        max_pct = calculate_hr_zones_max_pct(185)
        # Karvonen zone 1 lower should be higher than max_pct zone 1 lower
        # (HRR shifts zones up relative to pure % max HR)
        assert karvonen.zone1_lower > max_pct.zone1_lower
