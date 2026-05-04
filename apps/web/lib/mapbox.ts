/**
 * Mapbox helpers. Token read from NEXT_PUBLIC_MAPBOX_TOKEN.
 * If unset, functions return null — components fall back to static chart.
 */

import type { ElevationPoint, Race, RaceSegment } from './types'

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

export const SEGMENT_COLOURS: Record<string, string> = {
  easy: '#1D9E75',
  moderate: '#EF9F27',
  hard: '#E24B4A',
}

/**
 * Build a GeoJSON LineString feature for the course, colouring each point
 * by the segment difficulty it falls within.
 */
export function buildCourseGeoJson(race: Race): {
  type: 'FeatureCollection'
  features: unknown[]
} {
  const profile = race.elevation_profile.filter(p => p.lat && p.lng)
  if (profile.length < 2) return { type: 'FeatureCollection', features: [] }

  // Build one LineString per segment for colour coding (segments in km, profile in miles)
  const KM_PER_MILE = 1.60934
  const features = race.segments.map(seg => {
    const startMile = seg.start_km / KM_PER_MILE
    const endMile = seg.end_km / KM_PER_MILE
    const points = profile.filter(p => p.mile >= startMile && p.mile <= endMile)
    if (points.length < 2) return null
    return {
      type: 'Feature',
      properties: {
        difficulty: seg.difficulty,
        color: SEGMENT_COLOURS[seg.difficulty] ?? '#6B7280',
        name: seg.name,
      },
      geometry: {
        type: 'LineString',
        coordinates: points.map(p => [p.lng!, p.lat!]),
      },
    }
  })

  return {
    type: 'FeatureCollection',
    features: features.filter(Boolean),
  }
}

/**
 * Build GeoJSON point markers for segment boundaries and critical points.
 */
export function buildSegmentMarkers(race: Race): unknown[] {
  const KM_PER_MILE = 1.60934
  return race.segments.map(seg => ({
    type: 'Feature',
    properties: {
      label: seg.name,
      difficulty: seg.difficulty,
    },
    geometry: {
      type: 'Point',
      coordinates: (() => {
        const startMile = seg.start_km / KM_PER_MILE
        const pt = race.elevation_profile.find(p => p.mile >= startMile && p.lat)
        return pt ? [pt.lng!, pt.lat!] : [race.start.lng, race.start.lat]
      })(),
    },
  }))
}

/**
 * Compute the bounding box for the full course.
 */
export function courseBounds(
  race: Race
): [[number, number], [number, number]] {
  const profile = race.elevation_profile.filter(p => p.lat && p.lng)
  if (profile.length === 0) {
    return [
      [race.finish.lng, race.finish.lat],
      [race.start.lng, race.start.lat],
    ]
  }
  const lats = profile.map(p => p.lat!)
  const lngs = profile.map(p => p.lng!)
  return [
    [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
    [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
  ]
}

/** Format seconds as MM:SS pace string */
export function formatPace(secPerKm: number): string {
  const total = Math.round(secPerKm)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Format total seconds as H:MM:SS */
export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
