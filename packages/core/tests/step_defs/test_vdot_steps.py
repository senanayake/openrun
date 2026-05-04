"""BDD step definitions for VDOT feature."""

from __future__ import annotations

from pytest_bdd import given, parsers, scenarios, then, when

from openrun.vdot import (
    InvalidRaceInputError,
    InvalidVDOTError,
    calculate_vdot,
    generate_training_paces,
    predict_race_time,
)

scenarios("vdot.feature")


@given("the Daniels-Gilbert 1979 VO2max formula is in use")
def formula_in_use() -> None:
    pass


@given(parsers.parse("a runner completes {distance:f} kilometres in {time:d} seconds"))
def runner_performance(ctx: dict, distance: float, time: int) -> None:
    ctx["distance_km"] = distance
    ctx["time_seconds"] = float(time)


@given(parsers.parse("an athlete has VDOT {vdot:f}"))
def athlete_vdot(ctx: dict, vdot: float) -> None:
    ctx["vdot"] = vdot


@when("VDOT is calculated")
def calc_vdot(ctx: dict) -> None:
    try:
        ctx["result"] = calculate_vdot(ctx["distance_km"], ctx["time_seconds"])
        ctx["error"] = None
    except InvalidRaceInputError as exc:
        ctx["result"] = None
        ctx["error"] = exc


@when("training paces are generated")
def gen_paces(ctx: dict) -> None:
    try:
        ctx["paces"] = generate_training_paces(ctx["vdot"])
        ctx["error"] = None
    except InvalidVDOTError as exc:
        ctx["paces"] = None
        ctx["error"] = exc


@when(parsers.parse("marathon finish time is predicted for {distance:f} kilometres"))
def predict_time(ctx: dict, distance: float) -> None:
    try:
        ctx["predicted"] = predict_race_time(ctx["vdot"], distance)
        ctx["error"] = None
    except InvalidVDOTError as exc:
        ctx["predicted"] = None
        ctx["error"] = exc


@then(parsers.parse("the VDOT result should be approximately {expected:f} within {pct:d} percent"))
def check_vdot_result(ctx: dict, expected: float, pct: int) -> None:
    assert ctx["result"] is not None
    assert abs(ctx["result"] - expected) / expected <= pct / 100.0


@then("the easy pace should be slower than marathon pace")
def easy_slower_than_marathon(ctx: dict) -> None:
    paces = ctx["paces"]
    assert paces.easy_lower_sec_per_km > paces.marathon_sec_per_km


@then("the marathon pace should be slower than threshold pace")
def marathon_slower_than_threshold(ctx: dict) -> None:
    paces = ctx["paces"]
    assert paces.marathon_sec_per_km > paces.threshold_sec_per_km


@then("the threshold pace should be slower than interval pace")
def threshold_slower_than_interval(ctx: dict) -> None:
    paces = ctx["paces"]
    assert paces.threshold_sec_per_km > paces.interval_sec_per_km


@then("the interval pace should be slower than repetition pace")
def interval_slower_than_rep(ctx: dict) -> None:
    paces = ctx["paces"]
    assert paces.interval_sec_per_km > paces.repetition_sec_per_km


@then(parsers.parse("the predicted time should be within {pct:d} percent of {expected:d} seconds"))
def check_predicted_time(ctx: dict, pct: int, expected: int) -> None:
    assert ctx["predicted"] is not None
    assert abs(ctx["predicted"] - expected) / expected <= pct / 100.0


@then("an InvalidRaceInputError should be raised")
def check_race_input_error(ctx: dict) -> None:
    assert isinstance(ctx["error"], InvalidRaceInputError)


@then("an InvalidVDOTError should be raised")
def check_vdot_error(ctx: dict) -> None:
    assert isinstance(ctx["error"], InvalidVDOTError)
