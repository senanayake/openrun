"""Training load model — TSS, ATL (fatigue), CTL (fitness), TSB (form).

Implements the Banister impulse-response model (1975).

TSS for a run:
  TSS = (duration_s * NGP * IF) / (FTP * 3600) * 100
  IF  = NGP / FTP
  NGP = normalised graded pace (= raw pace when no elevation data)

CTL (42-day EMA):  CTL_t = CTL_{t-1} + (TSS_t - CTL_{t-1}) / 42
ATL (7-day EMA):   ATL_t = ATL_{t-1} + (TSS_t - ATL_{t-1}) / 7
TSB:               TSB_t = CTL_t - ATL_t
"""

from __future__ import annotations

from datetime import date, timedelta

from openrun.models import TrainingLoadSnapshot, TrainingWarning

_CTL_DAYS = 42
_ATL_DAYS = 7
_OVERTRAINING_ATL_CTL_RATIO = 1.5
_VERY_FRESH_TSB = 25.0
_RACE_READY_TSB_MIN = 10.0
_RACE_READY_TSB_MAX = 25.0
_HEAVY_BLOCK_TSB = -20.0
_OVERTRAINING_TSB = -30.0


def calculate_tss(
    duration_seconds: int,
    avg_pace_sec_per_km: float,
    ftp_sec_per_km: float,
    elevation_gain_m: float = 0.0,
    distance_km: float = 0.0,
) -> float:
    """Calculate Training Stress Score for a single workout.

    Args:
        duration_seconds: Workout duration in seconds.
        avg_pace_sec_per_km: Average pace in seconds per kilometre.
        ftp_sec_per_km: Functional threshold pace (threshold pace from VDOT).
        elevation_gain_m: Total elevation gain in metres (used for NGP adjustment).
        distance_km: Distance in km (needed for elevation-adjusted NGP).

    Returns:
        TSS as a float. A threshold-pace 1-hour effort scores ~100.
    """
    if duration_seconds <= 0:
        raise ValueError("duration_seconds must be positive")
    if avg_pace_sec_per_km <= 0 or ftp_sec_per_km <= 0:
        raise ValueError("pace values must be positive")

    ngp = _normalised_graded_pace(avg_pace_sec_per_km, elevation_gain_m, distance_km)
    intensity_factor = ftp_sec_per_km / ngp
    tss = (duration_seconds * intensity_factor ** 2) / 3600.0 * 100.0
    return tss


def _normalised_graded_pace(
    pace_sec_per_km: float,
    elevation_gain_m: float,
    distance_km: float,
) -> float:
    """Adjust pace for elevation. Grade = elevation_gain / distance."""
    if distance_km <= 0 or elevation_gain_m <= 0:
        return pace_sec_per_km

    grade_pct = (elevation_gain_m / (distance_km * 1000)) * 100
    # Approximate 1% grade slows pace by ~8 sec/km (Minetti, 2002)
    adjustment = grade_pct * 8.0
    # NGP is the equivalent flat pace — higher grade means equivalent faster flat effort
    # so NGP is faster (lower sec/km) than raw pace
    return max(pace_sec_per_km - adjustment, 1.0)


def update_load(
    current_ctl: float,
    current_atl: float,
    tss: float,
) -> tuple[float, float, float]:
    """Apply one day's TSS to CTL and ATL using exponential moving averages.

    Returns:
        (new_ctl, new_atl, new_tsb)
    """
    new_ctl = current_ctl + (tss - current_ctl) / _CTL_DAYS
    new_atl = current_atl + (tss - current_atl) / _ATL_DAYS
    new_tsb = new_ctl - new_atl
    return new_ctl, new_atl, new_tsb


def build_load_history(
    daily_tss: list[float],
    start_date: date,
    initial_ctl: float = 0.0,
    initial_atl: float = 0.0,
) -> list[TrainingLoadSnapshot]:
    """Build a time-series of CTL/ATL/TSB snapshots from a list of daily TSS values.

    Args:
        daily_tss: One TSS value per day, in chronological order.
        start_date: Date of the first entry.
        initial_ctl: Starting CTL (fitness).
        initial_atl: Starting ATL (fatigue).

    Returns:
        List of TrainingLoadSnapshot, one per day.
    """
    snapshots = []
    ctl, atl = initial_ctl, initial_atl
    for i, tss in enumerate(daily_tss):
        ctl, atl, tsb = update_load(ctl, atl, tss)
        snapshots.append(
            TrainingLoadSnapshot(
                date=start_date + timedelta(days=i),
                ctl=round(ctl, 4),
                atl=round(atl, 4),
                tsb=round(tsb, 4),
            )
        )
    return snapshots


def assess_readiness(ctl: float, atl: float) -> list[TrainingWarning]:
    """Assess training readiness and return any warnings.

    Args:
        ctl: Current chronic training load (fitness).
        atl: Current acute training load (fatigue).

    Returns:
        List of TrainingWarning objects (may be empty).
    """
    tsb = ctl - atl
    warnings = []

    if ctl > 0 and atl / ctl >= _OVERTRAINING_ATL_CTL_RATIO:
        warnings.append(
            TrainingWarning(
                code="OVERTRAINING_RISK",
                message=(
                    f"ATL/CTL ratio is {atl / ctl:.2f} — acute load greatly exceeds fitness. "
                    "Reduce training volume immediately."
                ),
                severity="critical",
            )
        )
    elif tsb < _OVERTRAINING_TSB:
        warnings.append(
            TrainingWarning(
                code="OVERTRAINING_RISK",
                message=f"TSB is {tsb:.1f} — form deeply negative. Overtraining risk is high.",
                severity="critical",
            )
        )
    elif tsb < _HEAVY_BLOCK_TSB:
        warnings.append(
            TrainingWarning(
                code="HEAVY_TRAINING_BLOCK",
                message=f"TSB is {tsb:.1f} — you are in a hard training block. Monitor closely.",
                severity="warning",
            )
        )
    elif tsb > _VERY_FRESH_TSB:
        warnings.append(
            TrainingWarning(
                code="POSSIBLY_UNDERTRAINED",
                message=f"TSB is {tsb:.1f} — very fresh. You may be undertrained for goal race.",
                severity="info",
            )
        )

    return warnings
