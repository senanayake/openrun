"""BDD step definitions for periodization feature."""

from __future__ import annotations

import uuid
from datetime import date, timedelta

from pytest_bdd import given, parsers, scenarios, then, when

from openrun.models import TrainingPhase
from openrun.periodization import build_periodization_plan

scenarios("periodization.feature")


@given(parsers.parse("a race {days:d} days from today"))
def race_days_away(ctx: dict, days: int) -> None:
    ctx["race_date"] = date.today() + timedelta(days=days)
    ctx["current_date"] = date.today()


@given(parsers.parse("current weekly mileage of {miles:f} miles"))
def weekly_mileage(ctx: dict, miles: float) -> None:
    ctx["mileage"] = miles


@given(parsers.parse("course difficulty of {difficulty}"))
def course_difficulty(ctx: dict, difficulty: str) -> None:
    ctx["difficulty"] = difficulty


@when("the periodization plan is built")
def build_plan(ctx: dict) -> None:
    try:
        ctx["plan"] = build_periodization_plan(
            race_date=ctx["race_date"],
            current_date=ctx["current_date"],
            current_weekly_mileage=ctx["mileage"],
            athlete_id=uuid.uuid4(),
            race_id="test-race",
            course_difficulty=ctx["difficulty"],
        )
        ctx["error"] = None
    except ValueError as exc:
        ctx["plan"] = None
        ctx["error"] = exc


@then(parsers.parse("the plan should contain exactly {n:d} weeks"))
def check_n_weeks(ctx: dict, n: int) -> None:
    assert len(ctx["plan"].weeks) == n


@then(parsers.parse("weeks {start:d} through {end:d} should be in the {phase_name} phase"))
def check_phase_range(ctx: dict, start: int, end: int, phase_name: str) -> None:
    phase = TrainingPhase(phase_name.lower())
    weeks = ctx["plan"].weeks
    for w in weeks:
        if start <= w.week_number <= end:
            assert w.phase == phase, (
                f"Week {w.week_number} should be {phase_name}, got {w.phase}"
            )


@then(parsers.parse("week {week_num:d} should be marked as a recovery week"))
def check_recovery_week(ctx: dict, week_num: int) -> None:
    week = next(w for w in ctx["plan"].weeks if w.week_number == week_num)
    assert week.is_recovery_week


@then(parsers.parse("the last week mileage should be less than {pct:d} percent of peak mileage"))
def check_taper_last_week(ctx: dict, pct: int) -> None:
    weeks = ctx["plan"].weeks
    peak = max(w.target_mileage for w in weeks)
    last_week = weeks[-1]
    assert last_week.target_mileage < peak * (pct / 100.0)


@then("a ValueError should be raised")
def check_value_error(ctx: dict) -> None:
    assert isinstance(ctx["error"], ValueError)


@then("at least one specific-phase week should include Hill repeats")
def check_hill_weeks(ctx: dict) -> None:
    specific_weeks = [
        w for w in ctx["plan"].weeks if w.phase == TrainingPhase.SPECIFIC
    ]
    hill_weeks = [w for w in specific_weeks if "Hill repeats" in w.key_workouts]
    assert len(hill_weeks) >= 1
