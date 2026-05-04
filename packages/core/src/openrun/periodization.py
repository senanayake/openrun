"""Training periodization planner.

Implements a four-phase model (Base → Support → Specific → Taper)
influenced by Canova and Daniels' plan structures.

Phase lengths:
  Base:     weeks  1– 6
  Support:  weeks  7–12
  Specific: weeks 13–19
  Taper:    weeks 20–22

Mileage rules:
  - Maximum 10% week-over-week increase (the 10% rule)
  - Every 4th week is a recovery week (~80% of previous week's volume)
  - Taper: ~75%, ~60%, ~30% of peak mileage in weeks 20, 21, 22
"""

from __future__ import annotations

from datetime import date, timedelta

from openrun.models import TrainingPhase, TrainingPlan, TrainingWeek

_TOTAL_WEEKS = 22
_PHASE_MAP: dict[TrainingPhase, tuple[int, int]] = {
    TrainingPhase.BASE: (1, 6),
    TrainingPhase.SUPPORT: (7, 12),
    TrainingPhase.SPECIFIC: (13, 19),
    TrainingPhase.TAPER: (20, 22),
}

_PHASE_KEY_WORKOUTS: dict[TrainingPhase, list[str]] = {
    TrainingPhase.BASE: ["Easy long run", "Strides", "Easy miles"],
    TrainingPhase.SUPPORT: ["Interval session (I-pace)", "Threshold run (T-pace)", "Long run"],
    TrainingPhase.SPECIFIC: [
        "Marathon pace long run",
        "Hill repeats",
        "Threshold intervals",
        "Race-specific long run",
    ],
    TrainingPhase.TAPER: ["Race pace strides", "Short tempo", "Easy shakeout"],
}

_MAX_WEEKLY_INCREASE = 0.10
_RECOVERY_WEEK_FACTOR = 0.80
_TAPER_FACTORS = {20: 0.75, 21: 0.60, 22: 0.30}
_HILL_WORK_PHASE = TrainingPhase.SPECIFIC


def _phase_for_week(week_number: int) -> TrainingPhase:
    for phase, (start, end) in _PHASE_MAP.items():
        if start <= week_number <= end:
            return phase
    raise ValueError(f"week_number {week_number} is outside the 22-week plan")


def build_periodization_plan(
    race_date: date,
    current_date: date,
    current_weekly_mileage: float,
    athlete_id: object,
    race_id: str,
    course_difficulty: str = "moderate",
) -> TrainingPlan:
    """Build a 22-week periodization plan for a target race.

    Args:
        race_date: The goal race date.
        current_date: Today's date (plan start).
        current_weekly_mileage: Athlete's current weekly mileage in miles.
        athlete_id: Athlete UUID.
        race_id: Race identifier string.
        course_difficulty: One of 'easy', 'moderate', 'moderate-hard', 'hard'.

    Returns:
        A TrainingPlan with 22 TrainingWeeks.
    """
    import uuid
    from datetime import datetime

    weeks_available = (race_date - current_date).days // 7

    if weeks_available < _TOTAL_WEEKS:
        raise ValueError(
            f"Only {weeks_available} weeks until race date — need at least {_TOTAL_WEEKS}"
        )

    hill_weeks_in_specific = _hill_week_numbers(course_difficulty)
    peak_mileage = _compute_peak_mileage(current_weekly_mileage)
    mileages = _build_mileage_sequence(current_weekly_mileage, peak_mileage)

    training_weeks = []
    for week_num in range(1, _TOTAL_WEEKS + 1):
        phase = _phase_for_week(week_num)
        is_recovery = week_num % 4 == 0 and week_num not in _TAPER_FACTORS
        mileage = mileages[week_num - 1]

        key_workouts = list(_PHASE_KEY_WORKOUTS[phase])
        if week_num in hill_weeks_in_specific:
            if "Hill repeats" not in key_workouts:
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


def _compute_peak_mileage(starting_mileage: float) -> float:
    """Estimate peak mileage achievable in the build (weeks 1-19).

    We apply 10% rule for build weeks, with recovery weeks at 80%.
    Peak is at end of Specific phase (week 18-19).
    """
    mileage = starting_mileage
    for week in range(1, 20):
        if week % 4 == 0:
            continue  # recovery week — no increase
        mileage = min(mileage * 1.10, mileage + 5)  # cap at 5 miles/week absolute
    return mileage


def _build_mileage_sequence(
    starting_mileage: float, peak_mileage: float
) -> list[float]:
    """Build week-by-week mileage for all 22 weeks."""
    mileages: list[float] = []
    mileage = starting_mileage
    taper_base = peak_mileage

    for week in range(1, _TOTAL_WEEKS + 1):
        if week in _TAPER_FACTORS:
            mileages.append(taper_base * _TAPER_FACTORS[week])
        elif week % 4 == 0:
            # Recovery week: 80% of previous week
            prev = mileages[-1] if mileages else mileage
            mileages.append(prev * _RECOVERY_WEEK_FACTOR)
        else:
            # Build week: up to 10% increase
            if mileages:
                prev = mileages[-1]
                # After recovery week, don't increase from the recovery value
                if (week - 1) % 4 == 0 and week > 1:
                    # Previous was recovery — resume from pre-recovery level
                    pre_recovery = mileages[-2] if len(mileages) >= 2 else mileage
                    mileage = min(pre_recovery * 1.10, pre_recovery + 5)
                else:
                    mileage = min(prev * 1.10, prev + 5)
            mileages.append(mileage)

    return mileages


def _hill_week_numbers(course_difficulty: str) -> set[int]:
    """Return week numbers within Specific phase that should include hill work."""
    if course_difficulty in ("moderate-hard", "hard"):
        return {13, 14, 15, 16, 17, 18}
    elif course_difficulty == "moderate":
        return {14, 16, 17, 18}
    return set()
