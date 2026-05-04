"""Contract tests — verify Next.js API routes match FastAPI schema."""
import pytest
import httpx


BASE_WEB = "http://localhost:3000"
BASE_CORE = "http://localhost:8001"


@pytest.mark.integration
class TestVdotContract:
    def test_web_and_core_agree_on_vdot(self):
        payload = {"distance_km": 42.195, "time_seconds": 11400}

        web_res = httpx.post(f"{BASE_WEB}/api/vdot", json=payload, timeout=10)
        core_res = httpx.post(f"{BASE_CORE}/vdot", json=payload, timeout=10)

        assert web_res.status_code == 200
        assert core_res.status_code == 200

        web = web_res.json()
        core = core_res.json()

        assert abs(web["vdot"] - core["vdot"]) < 0.1, "VDOT mismatch between web and core"
        assert web["marathon_seconds"] == pytest.approx(core["marathon_seconds"], rel=0.01)

    def test_pace_zones_have_five_zones(self):
        payload = {"distance_km": 10, "time_seconds": 2460}
        res = httpx.post(f"{BASE_WEB}/api/vdot", json=payload, timeout=10)
        assert res.status_code == 200
        data = res.json()
        assert len(data["pace_zones"]) == 5
        for zone in data["pace_zones"]:
            assert "zone" in zone
            assert "name" in zone
            assert "min_pace_sec_per_km" in zone
            assert "max_pace_sec_per_km" in zone
            assert "color" in zone


@pytest.mark.integration
class TestRaceContract:
    def test_race_list_matches_core_schema(self):
        res = httpx.get(f"{BASE_WEB}/api/races", timeout=10)
        assert res.status_code == 200
        races = res.json()
        assert isinstance(races, list)
        if races:
            race = races[0]
            required_fields = {"id", "name", "distance_km", "date", "bq_qualifier",
                               "elevation_gain_m", "elevation_loss_m", "elevation_profile"}
            assert required_fields.issubset(race.keys())

    def test_pace_bands_response_structure(self):
        res = httpx.get(
            f"{BASE_WEB}/api/races/twin-cities-marathon-2026/pace-bands",
            params={"goal_time_seconds": 12600},
            timeout=10,
        )
        assert res.status_code == 200
        data = res.json()
        assert "bands" in data
        for band in data["bands"]:
            assert "label" in band
            assert "start_km" in band
            assert "end_km" in band
            assert "target_pace_sec_per_km" in band
            assert "zone" in band


@pytest.mark.integration
class TestPlanContract:
    def test_generated_plan_has_22_weeks(self):
        res = httpx.post(
            f"{BASE_WEB}/api/plans",
            json={
                "race_id": "twin-cities-marathon-2026",
                "race_date": "2027-10-04",
                "goal_time_seconds": 12600,
                "current_vdot": 45.0,
                "current_weekly_mileage": 40,
            },
            timeout=30,
        )
        assert res.status_code == 200
        plan = res.json()
        assert len(plan["weeks"]) == 22

    def test_plan_phases_are_valid(self):
        res = httpx.post(
            f"{BASE_WEB}/api/plans",
            json={
                "race_id": "twin-cities-marathon-2026",
                "race_date": "2027-10-04",
                "goal_time_seconds": 12600,
                "current_vdot": 45.0,
                "current_weekly_mileage": 40,
            },
            timeout=30,
        )
        plan = res.json()
        valid_phases = {"base", "support", "specific", "taper"}
        for week in plan["weeks"]:
            assert week["phase"] in valid_phases
