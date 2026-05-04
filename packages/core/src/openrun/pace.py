"""Pace and speed conversion utilities.

All public functions accept and return SI-friendly units.
Internally: velocity in metres per minute (m/min).
"""

from __future__ import annotations


def sec_per_km_to_m_per_min(sec_per_km: float) -> float:
    """Convert pace (seconds per kilometre) to velocity (metres per minute)."""
    if sec_per_km <= 0:
        raise ValueError("pace must be positive")
    return 60_000.0 / sec_per_km


def m_per_min_to_sec_per_km(m_per_min: float) -> float:
    """Convert velocity (metres per minute) to pace (seconds per kilometre)."""
    if m_per_min <= 0:
        raise ValueError("velocity must be positive")
    return 60_000.0 / m_per_min


def sec_per_km_to_sec_per_mile(sec_per_km: float) -> float:
    """Convert pace in sec/km to sec/mile."""
    return sec_per_km * 1.609344


def sec_per_mile_to_sec_per_km(sec_per_mile: float) -> float:
    """Convert pace in sec/mile to sec/km."""
    return sec_per_mile / 1.609344


def format_pace(sec_per_km: float) -> str:
    """Return pace as MM:SS string (per kilometre)."""
    total = int(round(sec_per_km))
    minutes, seconds = divmod(total, 60)
    return f"{minutes}:{seconds:02d}"


def format_time(total_seconds: int) -> str:
    """Return duration as H:MM:SS string."""
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours}:{minutes:02d}:{seconds:02d}"


def km_to_miles(km: float) -> float:
    """Convert kilometres to miles."""
    return km / 1.609344


def miles_to_km(miles: float) -> float:
    """Convert miles to kilometres."""
    return miles * 1.609344


def hms_to_seconds(hours: int, minutes: int, seconds: int) -> int:
    """Convert hours/minutes/seconds to total seconds."""
    return hours * 3600 + minutes * 60 + seconds
