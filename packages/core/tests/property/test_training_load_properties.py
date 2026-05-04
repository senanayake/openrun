"""Property-based tests for training load model invariants."""

from __future__ import annotations

from datetime import date

from hypothesis import given, settings
from hypothesis import strategies as st

from openrun.training_load import (
    assess_readiness,
    build_load_history,
    calculate_tss,
    update_load,
)

_VALID_TSS = st.floats(min_value=0.1, max_value=500.0, allow_nan=False, allow_infinity=False)
_VALID_PACE = st.floats(min_value=150.0, max_value=600.0, allow_nan=False, allow_infinity=False)
_VALID_DURATION = st.integers(min_value=60, max_value=28800)
_VALID_LOAD = st.floats(min_value=0.0, max_value=200.0, allow_nan=False, allow_infinity=False)


@given(_VALID_DURATION, _VALID_PACE, _VALID_PACE)
@settings(max_examples=100)
def test_tss_always_positive(duration: int, pace: float, ftp: float) -> None:
    tss = calculate_tss(duration, pace, ftp)
    assert tss > 0


@given(_VALID_DURATION, _VALID_PACE)
@settings(max_examples=100)
def test_threshold_effort_scores_100(duration: int, ftp: float) -> None:
    tss = calculate_tss(duration, ftp, ftp)
    expected = duration / 3600.0 * 100.0
    assert abs(tss - expected) / expected < 1e-6


@given(_VALID_LOAD, _VALID_LOAD, _VALID_TSS)
@settings(max_examples=100)
def test_tsb_always_ctl_minus_atl(ctl: float, atl: float, tss: float) -> None:
    new_ctl, new_atl, new_tsb = update_load(ctl, atl, tss)
    assert abs(new_tsb - (new_ctl - new_atl)) < 1e-9


@given(_VALID_LOAD, _VALID_LOAD, _VALID_TSS)
@settings(max_examples=100)
def test_ctl_bounded_between_old_and_tss(ctl: float, atl: float, tss: float) -> None:
    new_ctl, _, _ = update_load(ctl, atl, tss)
    assert min(ctl, tss) <= new_ctl <= max(ctl, tss)


@given(
    st.lists(_VALID_TSS, min_size=1, max_size=60),
)
@settings(max_examples=50)
def test_load_history_tsb_invariant(daily_tss: list) -> None:
    history = build_load_history(daily_tss, date(2026, 1, 1))
    for snap in history:
        assert abs(snap.tsb - (snap.ctl - snap.atl)) < 1e-3


@given(
    st.lists(_VALID_TSS, min_size=7, max_size=7),
    st.lists(st.just(0.0), min_size=7, max_size=7),
)
@settings(max_examples=30)
def test_atl_decreases_after_rest(hard_block: list, rest: list) -> None:
    history = build_load_history(hard_block + rest, date(2026, 1, 1))
    atl_at_peak = history[6].atl
    atl_at_end = history[-1].atl
    assert atl_at_end < atl_at_peak


@given(_VALID_LOAD, _VALID_LOAD)
@settings(max_examples=50)
def test_assess_readiness_returns_list(ctl: float, atl: float) -> None:
    result = assess_readiness(ctl, atl)
    assert isinstance(result, list)
