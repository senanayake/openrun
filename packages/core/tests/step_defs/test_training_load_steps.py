"""BDD step definitions for training load feature."""

from __future__ import annotations

from datetime import date

from pytest_bdd import given, parsers, scenarios, then, when

from openrun.training_load import (
    assess_readiness,
    build_load_history,
    calculate_tss,
)

scenarios("training_load.feature")


@given(parsers.parse("a workout of {duration:d} seconds where average pace equals FTP pace"))
def threshold_workout(ctx: dict, duration: int) -> None:
    ctx["duration"] = duration
    ctx["ftp"] = 300.0
    ctx["avg_pace"] = 300.0


@given(
    parsers.parse(
        "a workout of {duration:d} seconds where average pace is {pct:d} percent slower than FTP"
    )
)
def easy_workout(ctx: dict, duration: int, pct: int) -> None:
    ctx["duration"] = duration
    ctx["ftp"] = 300.0
    ctx["avg_pace"] = 300.0 * (1 + pct / 100.0)


@given(
    parsers.parse("{days:d} days of {tss:f} TSS per day starting from zero fitness")
)
def consistent_training(ctx: dict, days: int, tss: float) -> None:
    ctx["daily_tss"] = [tss] * days
    ctx["start_date"] = date(2026, 1, 1)


@given(
    parsers.parse(
        "{hard_days:d} days of {hard_tss:f} TSS per day followed by {rest_days:d} rest days"
    )
)
def hard_block_then_rest(ctx: dict, hard_days: int, hard_tss: float, rest_days: int) -> None:
    ctx["daily_tss"] = [hard_tss] * hard_days + [0.0] * rest_days
    ctx["start_date"] = date(2026, 1, 1)


@given(parsers.parse("current CTL of {ctl:f} and ATL of {atl:f}"))
def readiness_inputs(ctx: dict, ctl: float, atl: float) -> None:
    ctx["ctl"] = ctl
    ctx["atl"] = atl


@when("TSS is calculated with no elevation")
def calc_tss(ctx: dict) -> None:
    ctx["tss_result"] = calculate_tss(
        duration_seconds=ctx["duration"],
        avg_pace_sec_per_km=ctx["avg_pace"],
        ftp_sec_per_km=ctx["ftp"],
    )


@when("load history is computed")
def compute_load_history(ctx: dict) -> None:
    ctx["history"] = build_load_history(ctx["daily_tss"], ctx["start_date"])


@when("readiness is assessed")
def assess(ctx: dict) -> None:
    ctx["warnings"] = assess_readiness(ctx["ctl"], ctx["atl"])


@then(parsers.parse("the TSS should be approximately {expected:f} within {pct:d} percent"))
def check_tss_approx(ctx: dict, expected: float, pct: int) -> None:
    assert abs(ctx["tss_result"] - expected) / expected <= pct / 100.0


@then(parsers.parse("the TSS should be less than {limit:f}"))
def check_tss_less_than(ctx: dict, limit: float) -> None:
    assert ctx["tss_result"] < limit


@then(parsers.parse("the final CTL should be approximately {expected:f} within {pct:d} percent"))
def check_final_ctl(ctx: dict, expected: float, pct: int) -> None:
    final_ctl = ctx["history"][-1].ctl
    assert abs(final_ctl - expected) / expected <= pct / 100.0


@then(parsers.parse("the ATL on the last day should be lower than the ATL at day {peak_day:d}"))
def check_atl_dropped(ctx: dict, peak_day: int) -> None:
    peak_atl = ctx["history"][peak_day - 1].atl
    final_atl = ctx["history"][-1].atl
    assert final_atl < peak_atl


@then(
    parsers.parse(
        "an OVERTRAINING_RISK warning should be present with {severity} severity"
    )
)
def check_overtraining_warning(ctx: dict, severity: str) -> None:
    matching = [
        w for w in ctx["warnings"]
        if w.code == "OVERTRAINING_RISK" and w.severity == severity
    ]
    assert len(matching) >= 1


@then("no warnings with critical severity should be present")
def check_no_critical(ctx: dict) -> None:
    assert not any(w.severity == "critical" for w in ctx["warnings"])


@then("a HEAVY_TRAINING_BLOCK warning should be present")
def check_heavy_block(ctx: dict) -> None:
    assert any(w.code == "HEAVY_TRAINING_BLOCK" for w in ctx["warnings"])
