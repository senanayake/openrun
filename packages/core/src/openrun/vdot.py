"""VDOT calculator and training pace engine.

Research basis: data/research/ — Daniels & Gilbert (1979), Oxygen Power.
See KB-2026-003 for the design-space analysis behind this choice.

Formulas:
  VO2 at velocity v (m/min):
    VO2 = -4.60 + 0.182258 * v + 0.000104 * v²

  Fraction of VO2max sustainable for race of duration t (minutes):
    pct = 0.8 + 0.1894393 * exp(-0.012778 * t)
              + 0.2989558 * exp(-0.1932605 * t)

  VDOT = VO2 / pct
"""

from __future__ import annotations

import math

from openrun.models import TrainingPaces

# Daniels five-zone model: (lower_pct_vo2max, upper_pct_vo2max)
_ZONE_PCT: dict[str, tuple[float, float]] = {
    "E": (0.65, 0.79),
    "M": (0.75, 0.84),
    "T": (0.83, 0.88),
    "I": (0.97, 1.00),
    "R": (1.05, 1.10),
}

_MIN_VALID_VDOT = 20.0
_MAX_VALID_VDOT = 85.0


class InvalidRaceInputError(ValueError):
    """Raised when race inputs are physiologically implausible."""


class InvalidVDOTError(ValueError):
    """Raised when a VDOT value is outside the supported range."""


def _vo2_at_velocity(v: float) -> float:
    """VO2 demand (mL/kg/min) at velocity v (metres per minute)."""
    return -4.60 + 0.182258 * v + 0.000104 * v ** 2


def _pct_vo2max(t: float) -> float:
    """Fraction of VO2max sustainable for a race of duration t (minutes)."""
    return (
        0.8
        + 0.1894393 * math.exp(-0.012778 * t)
        + 0.2989558 * math.exp(-0.1932605 * t)
    )


def _velocity_for_vo2_fraction(vdot: float, pct: float) -> float:
    """Velocity (m/min) at which VO2 = vdot * pct.

    Solves: 0.000104*v² + 0.182258*v - (4.60 + vdot*pct) = 0
    """
    target = vdot * pct
    a = 0.000104
    b = 0.182258
    c = -(4.60 + target)
    discriminant = b ** 2 - 4 * a * c
    if discriminant < 0:
        raise ValueError(f"No real velocity solution for VDOT={vdot}, pct={pct}")
    return (-b + math.sqrt(discriminant)) / (2 * a)


def _bisect(f: object, a: float, b: float, tol: float = 1e-6, max_iter: int = 100) -> float:
    """Bisection root-finder for monotone functions on [a, b]."""
    fa = f(a)  # type: ignore[operator]
    for _ in range(max_iter):
        mid = (a + b) / 2.0
        fm = f(mid)  # type: ignore[operator]
        if abs(fm) < tol or (b - a) / 2 < tol:
            return mid
        if fa * fm > 0:
            a, fa = mid, fm
        else:
            b = mid
    return (a + b) / 2.0


def calculate_vdot(distance_km: float, time_seconds: float) -> float:
    """Calculate VDOT from a race performance.

    Args:
        distance_km: Race distance in kilometres.
        time_seconds: Finish time in seconds.

    Returns:
        VDOT value (mL/kg/min equivalent).

    Raises:
        InvalidRaceInputError: If inputs are physiologically implausible.
    """
    if distance_km <= 0:
        raise InvalidRaceInputError("distance_km must be positive")
    if time_seconds <= 0:
        raise InvalidRaceInputError("time_seconds must be positive")

    t_min = time_seconds / 60.0
    v = distance_km * 1000.0 / t_min

    vo2 = _vo2_at_velocity(v)
    if vo2 <= 0:
        raise InvalidRaceInputError(
            f"Velocity {v:.1f} m/min produces non-positive VO2 — pace too slow"
        )

    pct = _pct_vo2max(t_min)
    vdot = vo2 / pct

    if vdot < 5:
        raise InvalidRaceInputError(
            f"Calculated VDOT {vdot:.1f} is implausibly low — check inputs"
        )

    return vdot


def predict_race_time(vdot: float, distance_km: float) -> int:
    """Predict finish time in seconds for given VDOT and race distance.

    Uses bisection to find t such that VDOT(distance, t) = vdot.

    Raises:
        InvalidVDOTError: If VDOT is outside the supported range.
    """
    if vdot < _MIN_VALID_VDOT:
        raise InvalidVDOTError(f"VDOT {vdot} is below minimum supported value {_MIN_VALID_VDOT}")
    if vdot > _MAX_VALID_VDOT:
        raise InvalidVDOTError(f"VDOT {vdot} is above maximum supported value {_MAX_VALID_VDOT}")

    d_m = distance_km * 1000.0

    def objective(t_min: float) -> float:
        v = d_m / t_min
        return _vo2_at_velocity(v) / _pct_vo2max(t_min) - vdot

    t_min = _bisect(objective, 1.0, 1440.0)
    return round(t_min * 60)


def generate_training_paces(vdot: float) -> TrainingPaces:
    """Generate all five Daniels training zones from a VDOT value.

    Args:
        vdot: Athlete's current VDOT.

    Returns:
        TrainingPaces with lower and upper bounds for each zone in sec/km.

    Raises:
        InvalidVDOTError: If VDOT is outside the supported range.
    """
    if vdot < _MIN_VALID_VDOT:
        raise InvalidVDOTError(f"VDOT {vdot:.1f} below minimum {_MIN_VALID_VDOT}")
    if vdot > _MAX_VALID_VDOT:
        raise InvalidVDOTError(f"VDOT {vdot:.1f} above maximum {_MAX_VALID_VDOT}")

    def pace_at(pct: float) -> float:
        v = _velocity_for_vo2_fraction(vdot, pct)
        return 60_000.0 / v  # sec/km

    e_lo, e_hi = _ZONE_PCT["E"]
    m_lo, m_hi = _ZONE_PCT["M"]
    t_lo, t_hi = _ZONE_PCT["T"]
    i_lo, i_hi = _ZONE_PCT["I"]
    r_lo, r_hi = _ZONE_PCT["R"]

    return TrainingPaces(
        vdot=vdot,
        # Lower pct = faster velocity = slower pace (higher sec/km)
        easy_lower_sec_per_km=pace_at(e_hi),
        easy_upper_sec_per_km=pace_at(e_lo),
        marathon_sec_per_km=pace_at((m_lo + m_hi) / 2),
        threshold_sec_per_km=pace_at(t_hi),
        interval_sec_per_km=pace_at((i_lo + i_hi) / 2),
        repetition_sec_per_km=pace_at(r_lo),
    )
