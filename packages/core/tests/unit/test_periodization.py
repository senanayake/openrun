"""Unit tests for openrun.periodization."""

from __future__ import annotations

import uuid
from datetime import date, timedelta

import pytest

from openrun.models import TrainingPhase
from openrun.periodization import (
    _build_mileage_sequence,
    _compute_peak_mileage,
    _hill_week_numbers,
    _phase_for_week,
    build_periodization_plan,
)

_RACE_DATE = date.today() + timedelta(days=175)
_CURRENT_DATE = date.today()
_ATHLETE_ID = uuid.uuid4()


def _make_plan(mileage: float = 30.0, difficulty: str = "moderate"):
    return build_periodization_plan(
        race_date=_RACE_DATE,
        current_date=_CURRENT_DATE,
        current_weekly_mileage=mileage,
        athlete_id=_ATHLETE_ID,
        race_id="test-race",
        course_difficulty=difficulty,
    )


class TestPhaseForWeek:
    @pytest.mark.parametrize("week,expected", [
        (1, TrainingPhase.BASE),
        (6, TrainingPhase.BASE),
        (7, TrainingPhase.SUPPORT),
        (12, TrainingPhase.SUPPORT),
        (13, TrainingPhase.SPECIFIC),
        (19, TrainingPhase.SPECIFIC),
        (20, TrainingPhase.TAPER),
        (22, TrainingPhase.TAPER),
    ])
    def test_phase_boundaries(self, week: int, expected: TrainingPhase) -> None:
        assert _phase_for_week(week) == expected

    def test_out_of_range_raises(self) -> None:
        with pytest.raises(ValueError):
            _phase_for_week(23)

    def test_zero_raises(self) -> None:
        with pytest.raises(ValueError):
            _phase_for_week(0)


class TestComputePeakMileage:
    def test_peak_exceeds_starting(self) -> None:
        assert _compute_peak_mileage(30.0) > 30.0

    def test_10_pct_rule_observed(self) -> None:
        # +5 km/week cap over 15 build weeks → max ~starting + 75
        starting = 30.0
        peak = _compute_peak_mileage(starting)
        assert peak < starting + 80  # sanity upper bound

    def test_higher_start_gives_higher_peak(self) -> None:
        assert _compute_peak_mileage(50.0) > _compute_peak_mileage(30.0)


class TestBuildMileageSequence:
    def test_length_is_22(self) -> None:
        seq = _build_mileage_sequence(30.0, 50.0)
        assert len(seq) == 22

    def test_recovery_weeks_lower_than_previous(self) -> None:
        seq = _build_mileage_sequence(30.0, 50.0)
        # Week 4 (index 3) is recovery — should be less than week 3 (index 2)
        assert seq[3] < seq[2]
        assert seq[7] < seq[6]

    def test_taper_week_22_is_30_pct_of_peak(self) -> None:
        peak = 50.0
        seq = _build_mileage_sequence(30.0, peak)
        assert abs(seq[21] - peak * 0.30) < 1.0

    def test_taper_week_20_is_75_pct_of_peak(self) -> None:
        peak = 50.0
        seq = _build_mileage_sequence(30.0, peak)
        assert abs(seq[19] - peak * 0.75) < 1.0

    def test_all_mileages_positive(self) -> None:
        seq = _build_mileage_sequence(25.0, 45.0)
        assert all(m > 0 for m in seq)


class TestHillWeekNumbers:
    def test_moderate_hard_returns_6_weeks(self) -> None:
        weeks = _hill_week_numbers("moderate-hard")
        assert len(weeks) == 6

    def test_hard_returns_6_weeks(self) -> None:
        weeks = _hill_week_numbers("hard")
        assert len(weeks) == 6

    def test_moderate_returns_fewer_weeks(self) -> None:
        weeks = _hill_week_numbers("moderate")
        assert len(weeks) < 6

    def test_easy_returns_empty(self) -> None:
        assert _hill_week_numbers("easy") == set()

    def test_all_in_specific_phase(self) -> None:
        for difficulty in ("moderate-hard", "hard", "moderate"):
            for week in _hill_week_numbers(difficulty):
                assert 13 <= week <= 19


class TestBuildPeriodizationPlan:
    def test_plan_has_22_weeks(self) -> None:
        assert len(_make_plan().weeks) == 22

    def test_week_numbers_sequential(self) -> None:
        plan = _make_plan()
        for i, w in enumerate(plan.weeks):
            assert w.week_number == i + 1

    def test_race_id_stored(self) -> None:
        plan = _make_plan()
        assert plan.race_id == "test-race"

    def test_recovery_weeks_flagged(self) -> None:
        plan = _make_plan()
        recovery_weeks = {w.week_number for w in plan.weeks if w.is_recovery_week}
        assert 4 in recovery_weeks
        assert 8 in recovery_weeks
        assert 12 in recovery_weeks

    def test_taper_weeks_not_recovery(self) -> None:
        plan = _make_plan()
        taper_weeks = [w for w in plan.weeks if w.phase == TrainingPhase.TAPER]
        for w in taper_weeks:
            assert not w.is_recovery_week

    def test_hill_repeats_in_specific_for_hard_course(self) -> None:
        plan = _make_plan(difficulty="moderate-hard")
        specific = [w for w in plan.weeks if w.phase == TrainingPhase.SPECIFIC]
        hill_weeks = [w for w in specific if "Hill repeats" in w.key_workouts]
        assert len(hill_weeks) >= 1

    def test_no_hill_repeats_for_easy_course(self) -> None:
        plan = _make_plan(difficulty="easy")
        for w in plan.weeks:
            assert "Hill repeats" not in w.key_workouts

    def test_insufficient_weeks_raises(self) -> None:
        with pytest.raises(ValueError, match="weeks"):
            build_periodization_plan(
                race_date=date.today() + timedelta(days=100),
                current_date=date.today(),
                current_weekly_mileage=30.0,
                athlete_id=_ATHLETE_ID,
                race_id="test",
            )

    def test_peak_mileage_in_specific_phase(self) -> None:
        plan = _make_plan()
        specific = [w for w in plan.weeks if w.phase == TrainingPhase.SPECIFIC]
        non_specific = [w for w in plan.weeks if w.phase != TrainingPhase.SPECIFIC and not w.is_recovery_week]
        max_specific = max(w.target_mileage for w in specific)
        max_other = max(w.target_mileage for w in non_specific)
        assert max_specific >= max_other
