"""Heart rate zone models.

Implements:
  - Karvonen (Heart Rate Reserve) method
  - Percentage of max HR method (fallback when resting HR unavailable)
"""

from __future__ import annotations

from openrun.models import HRZones

# Karvonen %HRR bands for five zones
_KARVONEN_BANDS: list[tuple[float, float]] = [
    (0.50, 0.60),  # Zone 1: Recovery
    (0.60, 0.70),  # Zone 2: Aerobic
    (0.70, 0.80),  # Zone 3: Tempo / MP
    (0.80, 0.90),  # Zone 4: Threshold
    (0.90, 1.00),  # Zone 5: VO2max
]

# %MaxHR bands for five zones
_MAX_HR_BANDS: list[tuple[float, float]] = [
    (0.50, 0.60),
    (0.60, 0.70),
    (0.70, 0.80),
    (0.80, 0.90),
    (0.90, 1.00),
]


class InvalidHeartRateError(ValueError):
    """Raised when heart rate inputs are physiologically impossible."""


def calculate_hr_zones_karvonen(max_hr: int, resting_hr: int) -> HRZones:
    """Calculate heart rate zones using the Karvonen (HRR) method.

    Zone_N = resting_hr + HRR * pct

    Args:
        max_hr: Maximum heart rate in bpm.
        resting_hr: Resting heart rate in bpm.

    Raises:
        InvalidHeartRateError: If inputs are physiologically impossible.
    """
    if max_hr <= 0 or resting_hr <= 0:
        raise InvalidHeartRateError("Heart rate values must be positive")
    if resting_hr >= max_hr:
        raise InvalidHeartRateError(
            f"resting_hr ({resting_hr}) must be less than max_hr ({max_hr})"
        )

    hrr = max_hr - resting_hr
    bounds = []
    for lo_pct, hi_pct in _KARVONEN_BANDS:
        lower = round(resting_hr + hrr * lo_pct)
        upper = round(resting_hr + hrr * hi_pct)
        bounds.append((lower, upper))

    return HRZones(
        method="karvonen",
        zone1_lower=bounds[0][0], zone1_upper=bounds[0][1],
        zone2_lower=bounds[1][0], zone2_upper=bounds[1][1],
        zone3_lower=bounds[2][0], zone3_upper=bounds[2][1],
        zone4_lower=bounds[3][0], zone4_upper=bounds[3][1],
        zone5_lower=bounds[4][0], zone5_upper=bounds[4][1],
    )


def calculate_hr_zones_max_pct(max_hr: int) -> HRZones:
    """Calculate heart rate zones as percentage of max HR.

    Args:
        max_hr: Maximum heart rate in bpm.

    Raises:
        InvalidHeartRateError: If max_hr is not physiologically plausible.
    """
    if max_hr <= 0:
        raise InvalidHeartRateError("max_hr must be positive")
    if max_hr < 60 or max_hr > 250:
        raise InvalidHeartRateError(
            f"max_hr {max_hr} is outside physiologically plausible range [60, 250]"
        )

    bounds = []
    for lo_pct, hi_pct in _MAX_HR_BANDS:
        bounds.append((round(max_hr * lo_pct), round(max_hr * hi_pct)))

    return HRZones(
        method="max_hr_pct",
        zone1_lower=bounds[0][0], zone1_upper=bounds[0][1],
        zone2_lower=bounds[1][0], zone2_upper=bounds[1][1],
        zone3_lower=bounds[2][0], zone3_upper=bounds[2][1],
        zone4_lower=bounds[3][0], zone4_upper=bounds[3][1],
        zone5_lower=bounds[4][0], zone5_upper=bounds[4][1],
    )


def zone_boundaries(zones: HRZones) -> list[tuple[int, int]]:
    """Return all five zone (lower, upper) pairs as a list."""
    return [
        (zones.zone1_lower, zones.zone1_upper),
        (zones.zone2_lower, zones.zone2_upper),
        (zones.zone3_lower, zones.zone3_upper),
        (zones.zone4_lower, zones.zone4_upper),
        (zones.zone5_lower, zones.zone5_upper),
    ]
