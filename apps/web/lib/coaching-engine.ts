/**
 * HTTP client for the packages/core FastAPI server (port 8001).
 */

import type { PaceBandsResponse, Race, TrainingPlan, VdotApiResponse } from './types'

const BASE = process.env.COACHING_ENGINE_URL ?? 'http://localhost:8001'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Coaching engine error ${res.status}: ${detail}`)
  }
  return res.json() as Promise<T>
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Coaching engine error ${res.status}: ${detail}`)
  }
  return res.json() as Promise<T>
}

export function calculateVdot(distanceKm: number, timeSeconds: number): Promise<VdotApiResponse> {
  return post('/vdot', { distance_km: distanceKm, time_seconds: timeSeconds })
}

export function generatePlan(params: {
  raceId: string
  raceDate: string
  startDate: string
  currentVdot: number
  currentWeeklyMileage: number
  athleteId?: string
}): Promise<TrainingPlan> {
  return post('/plans', {
    race_id: params.raceId,
    race_date: params.raceDate,
    start_date: params.startDate,
    current_vdot: params.currentVdot,
    current_weekly_mileage: params.currentWeeklyMileage,
    athlete_id: params.athleteId,
  })
}

export function calculateTss(params: {
  durationSeconds: number
  avgPaceSecPerKm: number
  ftpSecPerKm: number
  elevationGainM?: number
  distanceKm?: number
}): Promise<{ tss: number }> {
  return post('/tss', {
    duration_seconds: params.durationSeconds,
    avg_pace_sec_per_km: params.avgPaceSecPerKm,
    ftp_sec_per_km: params.ftpSecPerKm,
    elevation_gain_m: params.elevationGainM ?? 0,
    distance_km: params.distanceKm ?? 0,
  })
}

export function listRaces(): Promise<Race[]> {
  return get('/races')
}

export function getRace(raceId: string): Promise<Race> {
  return get(`/races/${raceId}`)
}

export function getPaceBands(raceId: string, goalTimeSeconds: number): Promise<PaceBandsResponse> {
  return get(`/races/${raceId}/pace-bands?goal_time_seconds=${goalTimeSeconds}`)
}
