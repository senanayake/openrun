"""BDD step definitions for race prediction feature."""

from __future__ import annotations

from pytest_bdd import given, parsers, scenarios, then, when

from openrun.race import (
    generate_pace_bands,
    identify_critical_segments,
    load_race,
    predict_course_time,
)
from openrun.vdot import predict_race_time

scenarios("race_prediction.feature")


@when(parsers.parse("the {race_id} race is loaded"))
def load_race_by_id(ctx: dict, race_id: str) -> None:
    ctx["race"] = load_race(race_id)


@given(parsers.parse("an athlete with VDOT {vdot:f}"))
def athlete_with_vdot(ctx: dict, vdot: float) -> None:
    ctx["vdot"] = vdot


@given(parsers.parse("the {race_id} course data is loaded"))
def load_course(ctx: dict, race_id: str) -> None:
    ctx["race"] = load_race(race_id)


@when("the course-adjusted finish time is predicted")
def predict_adjusted_time(ctx: dict) -> None:
    ctx["course_time"] = predict_course_time(ctx["vdot"], ctx["race"])
    ctx["flat_time"] = predict_race_time(ctx["vdot"], ctx["race"].distance_km)


@when("pace bands are generated for all segments")
def gen_pace_bands(ctx: dict) -> None:
    ctx["bands"] = generate_pace_bands(ctx["vdot"], ctx["race"], splits=len(ctx["race"].segments))


@when("critical segments are identified")
def find_critical(ctx: dict) -> None:
    ctx["critical"] = identify_critical_segments(ctx["race"])


@then(parsers.parse("the race name should contain {text}"))
def check_race_name(ctx: dict, text: str) -> None:
    assert text in ctx["race"].name


@then(parsers.parse("the course type should be {expected}"))
def check_course_type(ctx: dict, expected: str) -> None:
    assert ctx["race"].course_type == expected


@then(parsers.parse("the elevation adjustment factor should be {factor:f}"))
def check_adj_factor(ctx: dict, factor: float) -> None:
    assert abs(ctx["race"].elevation_adjustment_factor - factor) < 1e-6


@then("the course-adjusted time should be greater than the flat prediction")
def check_adjusted_greater(ctx: dict) -> None:
    assert ctx["course_time"] > ctx["flat_time"]


@then("the hard-difficulty segment pace should be slower than any easy-difficulty segment pace")
def check_pace_band_ordering(ctx: dict) -> None:
    bands = ctx["bands"]
    easy_paces = [b.target_pace_sec_per_km for b in bands if "flat" in b.adjustment_reason.lower() or "easy" in b.adjustment_reason.lower()]
    hard_paces = [b.target_pace_sec_per_km for b in bands if "hard" in b.adjustment_reason.lower()]
    if easy_paces and hard_paces:
        assert min(hard_paces) > max(easy_paces)


@then(parsers.parse("a segment containing {text} should be in the list"))
def check_critical_segment_contains(ctx: dict, text: str) -> None:
    names = [s.name for s in ctx["critical"]]
    assert any(text in name for name in names), f"No critical segment containing '{text}'; got: {names}"
