"""Unit tests for openrun.race."""

from __future__ import annotations

import pytest

from openrun.race import (
    calculate_course_adjustment_factor,
    generate_pace_bands,
    identify_critical_segments,
    load_race,
    predict_course_time,
)


@pytest.fixture
def tcm():
    return load_race("tcm-2026")


class TestLoadRace:
    def test_loads_tcm_by_id(self, tcm) -> None:
        assert tcm.id == "tcm-2026"

    def test_tcm_name_contains_twin_cities(self, tcm) -> None:
        assert "Twin Cities" in tcm.name

    def test_tcm_distance_is_marathon(self, tcm) -> None:
        assert abs(tcm.distance_km - 42.195) < 0.01

    def test_elevation_profile_non_empty(self, tcm) -> None:
        assert len(tcm.elevation_profile) > 0

    def test_segments_non_empty(self, tcm) -> None:
        assert len(tcm.segments) > 0

    def test_unknown_race_id_raises(self) -> None:
        with pytest.raises(FileNotFoundError):
            load_race("does-not-exist-2099")

    def test_bq_qualifier_flag(self, tcm) -> None:
        assert tcm.bq_qualifier is True

    def test_course_type(self, tcm) -> None:
        assert tcm.course_type == "point_to_point"


class TestCourseAdjustmentFactor:
    def test_tcm_factor_is_above_one(self, tcm) -> None:
        factor = calculate_course_adjustment_factor(tcm)
        assert factor > 1.0

    def test_tcm_factor_matches_json(self, tcm) -> None:
        assert abs(calculate_course_adjustment_factor(tcm) - 1.012) < 1e-6


class TestPredictCourseTime:
    def test_course_time_greater_than_flat(self, tcm) -> None:
        from openrun.vdot import predict_race_time
        vdot = 45.0
        flat = predict_race_time(vdot, tcm.distance_km)
        course = predict_course_time(vdot, tcm)
        assert course > flat

    def test_course_time_scales_with_factor(self, tcm) -> None:
        from openrun.vdot import predict_race_time
        vdot = 50.0
        flat = predict_race_time(vdot, tcm.distance_km)
        course = predict_course_time(vdot, tcm)
        expected = round(flat * tcm.elevation_adjustment_factor)
        assert course == expected


class TestGeneratePaceBands:
    def test_returns_bands_for_all_segments(self, tcm) -> None:
        bands = generate_pace_bands(50.0, tcm, splits=len(tcm.segments))
        assert len(bands) == len(tcm.segments)

    def test_splits_limits_output(self, tcm) -> None:
        bands = generate_pace_bands(50.0, tcm, splits=3)
        assert len(bands) == 3

    def test_hard_segment_slower_than_easy(self, tcm) -> None:
        bands = generate_pace_bands(50.0, tcm, splits=len(tcm.segments))
        easy = [b.target_pace_sec_per_km for b in bands if "easy" in b.adjustment_reason]
        hard = [b.target_pace_sec_per_km for b in bands if "hard" in b.adjustment_reason]
        if easy and hard:
            assert min(hard) > max(easy)

    def test_higher_vdot_gives_faster_paces(self, tcm) -> None:
        bands_45 = generate_pace_bands(45.0, tcm, splits=3)
        bands_55 = generate_pace_bands(55.0, tcm, splits=3)
        for b45, b55 in zip(bands_45, bands_55):
            assert b55.target_pace_sec_per_km < b45.target_pace_sec_per_km


class TestIdentifyCriticalSegments:
    def test_summit_avenue_is_critical(self, tcm) -> None:
        critical = identify_critical_segments(tcm)
        names = [s.name for s in critical]
        assert any("Summit" in n for n in names)

    def test_minnehaha_is_critical(self, tcm) -> None:
        critical = identify_critical_segments(tcm)
        names = [s.name for s in critical]
        assert any("Minnehaha" in n for n in names)

    def test_chain_of_lakes_not_critical(self, tcm) -> None:
        critical = identify_critical_segments(tcm)
        names = [s.name for s in critical]
        assert not any("Chain of Lakes" in n for n in names)

    def test_returns_list(self, tcm) -> None:
        result = identify_critical_segments(tcm)
        assert isinstance(result, list)
