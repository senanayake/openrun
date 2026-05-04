"""Unit tests for openrun.training_load."""

from __future__ import annotations

from datetime import date

import pytest

from openrun.training_load import (
    assess_readiness,
    build_load_history,
    calculate_tss,
    update_load,
)


class TestCalculateTss:
    def test_threshold_hour_scores_100(self) -> None:
        tss = calculate_tss(
            duration_seconds=3600,
            avg_pace_sec_per_km=300.0,
            ftp_sec_per_km=300.0,
        )
        assert abs(tss - 100.0) < 1.0

    def test_easier_pace_scores_less(self) -> None:
        easy = calculate_tss(
            duration_seconds=3600,
            avg_pace_sec_per_km=360.0,  # 20% slower
            ftp_sec_per_km=300.0,
        )
        assert easy < 100.0

    def test_harder_pace_scores_more(self) -> None:
        hard = calculate_tss(
            duration_seconds=3600,
            avg_pace_sec_per_km=270.0,  # 10% faster than FTP
            ftp_sec_per_km=300.0,
        )
        assert hard > 100.0

    def test_zero_duration_raises(self) -> None:
        with pytest.raises(ValueError):
            calculate_tss(0, 300.0, 300.0)

    def test_negative_duration_raises(self) -> None:
        with pytest.raises(ValueError):
            calculate_tss(-1, 300.0, 300.0)

    def test_zero_pace_raises(self) -> None:
        with pytest.raises(ValueError):
            calculate_tss(3600, 0.0, 300.0)

    def test_zero_ftp_raises(self) -> None:
        with pytest.raises(ValueError):
            calculate_tss(3600, 300.0, 0.0)

    def test_elevation_increases_tss(self) -> None:
        flat = calculate_tss(3600, 330.0, 300.0)
        hilly = calculate_tss(3600, 330.0, 300.0, elevation_gain_m=200.0, distance_km=10.0)
        assert hilly > flat

    def test_tss_scales_with_duration(self) -> None:
        one_hour = calculate_tss(3600, 300.0, 300.0)
        two_hours = calculate_tss(7200, 300.0, 300.0)
        assert abs(two_hours - 2 * one_hour) < 1.0


class TestUpdateLoad:
    def test_ctl_approaches_tss_over_42_days(self) -> None:
        ctl, atl = 0.0, 0.0
        for _ in range(42):
            ctl, atl, _ = update_load(ctl, atl, 50.0)
        # After 42 days of 50 TSS, CTL should be close to 50 * (1 - 1/e) ≈ 31.6
        assert 28 < ctl < 35

    def test_tsb_equals_ctl_minus_atl(self) -> None:
        ctl, atl, tsb = update_load(40.0, 55.0, 70.0)
        assert abs(tsb - (ctl - atl)) < 1e-9

    def test_rest_day_reduces_atl(self) -> None:
        _, atl1, _ = update_load(50.0, 80.0, 100.0)
        _, atl2, _ = update_load(50.0, 80.0, 0.0)
        assert atl2 < atl1

    def test_rest_day_also_reduces_ctl(self) -> None:
        ctl1, _, _ = update_load(50.0, 40.0, 100.0)
        ctl2, _, _ = update_load(50.0, 40.0, 0.0)
        assert ctl2 < ctl1


class TestBuildLoadHistory:
    def test_length_matches_input(self) -> None:
        history = build_load_history([50.0] * 30, date(2026, 1, 1))
        assert len(history) == 30

    def test_dates_are_sequential(self) -> None:
        history = build_load_history([50.0] * 5, date(2026, 1, 1))
        for i, snap in enumerate(history):
            assert snap.date == date(2026, 1, 1 + i)

    def test_tsb_equals_ctl_minus_atl_each_day(self) -> None:
        history = build_load_history([60.0, 0.0, 80.0, 0.0, 50.0], date(2026, 1, 1))
        for snap in history:
            assert abs(snap.tsb - (snap.ctl - snap.atl)) < 1e-3

    def test_ctl_increases_with_training(self) -> None:
        history = build_load_history([80.0] * 20, date(2026, 1, 1))
        assert history[-1].ctl > history[0].ctl

    def test_initial_ctl_used(self) -> None:
        history = build_load_history([0.0] * 5, date(2026, 1, 1), initial_ctl=60.0)
        assert history[0].ctl < 60.0  # decayed by one day


class TestAssessReadiness:
    def test_overtraining_risk_from_ratio(self) -> None:
        warnings = assess_readiness(ctl=40.0, atl=65.0)  # ratio > 1.5
        codes = [w.code for w in warnings]
        assert "OVERTRAINING_RISK" in codes

    def test_overtraining_risk_from_tsb(self) -> None:
        warnings = assess_readiness(ctl=50.0, atl=85.0)  # TSB = -35
        codes = [w.code for w in warnings]
        assert "OVERTRAINING_RISK" in codes

    def test_heavy_block_warning(self) -> None:
        warnings = assess_readiness(ctl=60.0, atl=85.0)  # TSB = -25
        codes = [w.code for w in warnings]
        assert "HEAVY_TRAINING_BLOCK" in codes or "OVERTRAINING_RISK" in codes

    def test_possibly_undertrained_when_very_fresh(self) -> None:
        warnings = assess_readiness(ctl=60.0, atl=30.0)  # TSB = +30
        codes = [w.code for w in warnings]
        assert "POSSIBLY_UNDERTRAINED" in codes

    def test_no_warning_in_race_ready_window(self) -> None:
        # TSB = 70 - 55 = 15, well within 10-25 range
        warnings = assess_readiness(ctl=70.0, atl=55.0)
        assert warnings == []

    def test_zero_ctl_skips_ratio_check(self) -> None:
        # Should not raise ZeroDivisionError
        warnings = assess_readiness(ctl=0.0, atl=0.0)
        assert isinstance(warnings, list)

    def test_critical_severity_on_overtraining(self) -> None:
        warnings = assess_readiness(ctl=40.0, atl=65.0)
        critical = [w for w in warnings if w.severity == "critical"]
        assert len(critical) >= 1
