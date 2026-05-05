"""Training periodization planner.

Implements a four-phase model (Base → Support → Specific → Taper)
influenced by Canova and Daniels' plan structures.

Phase proportions (any number of weeks ≥ 12):
  Taper:    always 3 weeks (fixed)
  Base:     ~32% of build weeks  (min 3)
  Support:  ~32% of build weeks  (min 2)
  Specific: remainder of build weeks

Mileage rules:
  - Maximum 10% week-over-week increase (the 10% rule)
  - Every 4th week is a recovery week (~80% of previous week's volume)
  - Taper: ~75%, ~60%, ~30% of peak mileage in last 3 weeks
"""

from __future__ import annotations

from datetime import date, timedelta

from openrun.models import TrainingPhase, TrainingPlan, TrainingWeek

_TAPER_WEEKS = 3
_MIN_PLAN_WEEKS = 12

_PHASE_KEY_WORKOUTS: dict[TrainingPhase, list[str]] = {
    TrainingPhase.BASE: ["Easy long run", "Strides", "Easy miles"],
    TrainingPhase.SUPPORT: ["Interval session (I-pace)", "Threshold run (T-pace)", "Long run"],
    TrainingPhase.SPECIFIC: [
        "Marathon pace long run",
        "Threshold intervals",
        "Race-specific long run",
    ],
    TrainingPhase.TAPER: ["Race pace strides", "Short tempo", "Easy shakeout"],
}

_MAX_WEEKLY_INCREASE = 0.10
_RECOVERY_WEEK_FACTOR = 0.80
_HILL_WORK_PHASE = TrainingPhase.SPECIFIC


def _compute_phase_boundaries(total_weeks: int) -> dict[TrainingPhase, tuple[int, int]]:
    """Compute phase start/end week numbers for a plan of any length."""
    taper_start = total_weeks - _TAPER_WEEKS + 1
    build_weeks = total_weeks - _TAPER_WEEKS

    # Proportional to original 22-week ratio: 6 base / 6 support / 7 specific
    base_count = max(3, round(build_weeks * 6 / 19))
    support_count = max(2, round(build_weeks * 6 / 19))
    specific_count = build_weeks - base_count - support_count

    return {
        TrainingPhase.BASE: (1, base_count),
        TrainingPhase.SUPPORT: (base_count + 1, base_count + support_count),
        TrainingPhase.SPECIFIC: (base_count + support_count + 1, taper_start - 1),
        TrainingPhase.TAPER: (taper_start, total_weeks),
    }


def _phase_for_week(week_number: int, total_weeks: int = 22) -> TrainingPhase:
    boundaries = _compute_phase_boundaries(total_weeks)
    for phase, (start, end) in boundaries.items():
        if start <= week_number <= end:
            return phase
    raise ValueError(f"week_number {week_number} is outside the {total_weeks}-week plan")


def build_periodization_plan(
    race_date: date,
    current_date: date,
    current_weekly_mileage: float,
    athlete_id: object,
    race_id: str,
    course_difficulty: str = "moderate",
) -> TrainingPlan:
    """Build a periodization plan sized to the available time until race day.

    Args:
        race_date: The goal race date.
        current_date: Today's date (plan start).
        current_weekly_mileage: Athlete's current weekly mileage.
        athlete_id: Athlete UUID.
        race_id: Race identifier string.
        course_difficulty: One of 'easy', 'moderate', 'moderate-hard', 'hard'.

    Returns:
        A TrainingPlan with one TrainingWeek per available week.

    Raises:
        ValueError: If fewer than 12 weeks remain until race day.
    """
    import uuid
    from datetime import datetime

    total_weeks = (race_date - current_date).days // 7

    if total_weeks < _MIN_PLAN_WEEKS:
        raise ValueError(
            f"Only {total_weeks} weeks until race date — need at least {_MIN_PLAN_WEEKS}"
        )

    boundaries = _compute_phase_boundaries(total_weeks)
    specific_start, specific_end = boundaries[TrainingPhase.SPECIFIC]
    taper_start = total_weeks - _TAPER_WEEKS + 1

    build_weeks = total_weeks - _TAPER_WEEKS
    hill_weeks = _hill_week_numbers(course_difficulty, specific_start, specific_end)
    peak_mileage = _compute_peak_mileage(current_weekly_mileage, build_weeks)
    mileages = _build_mileage_sequence(current_weekly_mileage, peak_mileage, total_weeks)

    taper_weeks_set = set(range(taper_start, total_weeks + 1))
    training_weeks = []

    for week_num in range(1, total_weeks + 1):
        phase = _phase_for_week(week_num, total_weeks)
        is_recovery = week_num % 4 == 0 and week_num not in taper_weeks_set
        mileage = mileages[week_num - 1]

        key_workouts = list(_PHASE_KEY_WORKOUTS[phase])
        if week_num in hill_weeks and "Hill repeats" not in key_workouts:
            key_workouts.append("Hill repeats")

        training_weeks.append(
            TrainingWeek(
                week_number=week_num,
                phase=phase,
                target_mileage=round(mileage, 1),
                is_recovery_week=is_recovery,
                key_workouts=key_workouts,
            )
        )

    return TrainingPlan(
        id=uuid.uuid4(),
        athlete_id=athlete_id,  # type: ignore[arg-type]
        race_id=race_id,
        race_date=race_date,
        created_at=datetime.now(),
        weeks=training_weeks,
    )


def _compute_peak_mileage(starting_mileage: float, build_weeks: int = 19) -> float:
    """Estimate peak mileage achievable over the build phase.

    Applies the 10% rule with a 5 km/week absolute cap. Recovery weeks
    (every 4th) are skipped.
    """
    mileage = starting_mileage
    for week in range(1, build_weeks + 1):
        if week % 4 == 0:
            continue
        mileage = min(mileage * 1.10, mileage + 5)
    return mileage


def _build_mileage_sequence(
    starting_mileage: float, peak_mileage: float, total_weeks: int = 22
) -> list[float]:
    """Build week-by-week mileage for the full plan."""
    taper_factors = {
        total_weeks - 2: 0.75,
        total_weeks - 1: 0.60,
        total_weeks: 0.30,
    }
    mileages: list[float] = []
    mileage = starting_mileage

    for week in range(1, total_weeks + 1):
        if week in taper_factors:
            mileages.append(peak_mileage * taper_factors[week])
        elif week % 4 == 0:
            prev = mileages[-1] if mileages else mileage
            mileages.append(prev * _RECOVERY_WEEK_FACTOR)
        else:
            if mileages:
                prev = mileages[-1]
                if (week - 1) % 4 == 0 and week > 1:
                    pre_recovery = mileages[-2] if len(mileages) >= 2 else mileage
                    mileage = min(pre_recovery * 1.10, pre_recovery + 5)
                else:
                    mileage = min(prev * 1.10, prev + 5)
            mileages.append(mileage)

    return mileages


def _hill_week_numbers(
    course_difficulty: str,
    specific_start: int = 13,
    specific_end: int = 19,
) -> set[int]:
    """Return week numbers in the Specific phase that should include hill work."""
    spec = list(range(specific_start, specific_end + 1))
    if course_difficulty in ("moderate-hard", "hard"):
        return set(spec[:-1])  # all specific weeks except the last
    elif course_difficulty == "moderate":
        return set(spec[1::2])  # every other week, skip first
    return set()
