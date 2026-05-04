"""Property-based tests for openrun.vdot invariants."""

from __future__ import annotations

import math

import pytest
from hypothesis import assume, given, settings
from hypothesis import strategies as st

from openrun.vdot import (
    InvalidRaceInputError,
    InvalidVDOTError,
    calculate_vdot,
    generate_training_paces,
    predict_race_time,
)

_VALID_DISTANCES = st.floats(min_value=1.0, max_value=100.0, allow_nan=False, allow_infinity=False)
_VALID_TIMES = st.floats(min_value=60.0, max_value=86400.0, allow_nan=False, allow_infinity=False)
_VALID_VDOTS = st.floats(min_value=20.0, max_value=85.0, allow_nan=False, allow_infinity=False)


@given(_VALID_DISTANCES, _VALID_TIMES)
@settings(max_examples=100)
def test_vdot_is_positive_for_any_valid_input(distance: float, time_s: float) -> None:
    try:
        vdot = calculate_vdot(distance, time_s)
        assert vdot > 0
    except InvalidRaceInputError:
        pass  # some extreme inputs are legitimately rejected


@given(_VALID_DISTANCES, _VALID_TIMES)
@settings(max_examples=100)
def test_faster_time_gives_higher_vdot(distance: float, time_s: float) -> None:
    faster_time = time_s * 0.9
    assume(faster_time > 10.0)
    try:
        vdot_slow = calculate_vdot(distance, time_s)
        vdot_fast = calculate_vdot(distance, faster_time)
        assert vdot_fast > vdot_slow
    except InvalidRaceInputError:
        pass


@given(_VALID_VDOTS, _VALID_DISTANCES)
@settings(max_examples=100)
def test_predict_then_calculate_roundtrip(vdot: float, distance: float) -> None:
    assume(distance >= 1.0)
    try:
        t = predict_race_time(vdot, distance)
        vdot_back = calculate_vdot(distance, float(t))
        assert abs(vdot_back - vdot) / vdot < 0.02  # 2% roundtrip tolerance
    except (InvalidVDOTError, InvalidRaceInputError):
        pass


@given(_VALID_VDOTS)
@settings(max_examples=50)
def test_training_paces_always_ordered(vdot: float) -> None:
    try:
        paces = generate_training_paces(vdot)
        assert paces.easy_lower_sec_per_km > paces.marathon_sec_per_km
        assert paces.marathon_sec_per_km > paces.threshold_sec_per_km
        assert paces.threshold_sec_per_km > paces.interval_sec_per_km
        assert paces.interval_sec_per_km > paces.repetition_sec_per_km
    except InvalidVDOTError:
        pass


@given(_VALID_VDOTS)
@settings(max_examples=50)
def test_all_paces_positive(vdot: float) -> None:
    try:
        paces = generate_training_paces(vdot)
        assert paces.easy_lower_sec_per_km > 0
        assert paces.marathon_sec_per_km > 0
        assert paces.threshold_sec_per_km > 0
        assert paces.interval_sec_per_km > 0
        assert paces.repetition_sec_per_km > 0
    except InvalidVDOTError:
        pass


@given(
    st.floats(min_value=20.0, max_value=60.0),
    st.floats(min_value=20.0, max_value=60.0),
    _VALID_DISTANCES,
)
@settings(max_examples=50)
def test_higher_vdot_predicts_faster_time(vdot1: float, vdot2: float, distance: float) -> None:
    assume(vdot1 != vdot2 and distance >= 1.0)
    try:
        t1 = predict_race_time(vdot1, distance)
        t2 = predict_race_time(vdot2, distance)
        if vdot1 > vdot2:
            assert t1 < t2
        else:
            assert t1 > t2
    except InvalidVDOTError:
        pass
