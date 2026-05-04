/**
 * Typed fetch wrappers for apps/web API routes (/api/*).
 */

import type {
  PaceBandsResponse,
  Race,
  RunLog,
  RunLogRequest,
  TrainingPlan,
  VdotApiResponse,
} from './types'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw Object.assign(new Error((err as { detail: string }).detail), { status: res.status })
  }
  return res.json() as Promise<T>
}

export const api = {
  vdot: {
    calculate: (distanceKm: number, timeSeconds: number) =>
      apiFetch<VdotApiResponse>('/api/vdot', {
        method: 'POST',
        body: JSON.stringify({ distance_km: distanceKm, time_seconds: timeSeconds }),
      }),
  },

  plans: {
    generate: (params: {
      raceId: string
      raceDate: string
      goalTimeSeconds: number
      currentVdot: number
      currentWeeklyMileage: number
    }) =>
      apiFetch<TrainingPlan>('/api/plans', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    rebuild: (params: {
      planId: string
      newStartDate: string
      currentVdot: number
      currentWeeklyMileage: number
    }) =>
      apiFetch<{ new_plan: TrainingPlan; diff: unknown }>('/api/plans/rebuild', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  },

  races: {
    list: () => apiFetch<Race[]>('/api/races'),
    get: (id: string) => apiFetch<Race>(`/api/races/${id}`),
    paceBands: (id: string, goalTimeSeconds: number) =>
      apiFetch<PaceBandsResponse>(`/api/races/${id}/pace-bands?goal_time_seconds=${goalTimeSeconds}`),
  },

  runs: {
    log: (run: RunLogRequest) =>
      apiFetch<RunLog>('/api/runs', { method: 'POST', body: JSON.stringify(run) }),
    get: (id: string) => apiFetch<unknown>(`/api/runs/${id}`),
  },

  athlete: {
    get: () => apiFetch<unknown>('/api/athlete'),
  },

  workouts: {
    get: (id: string) => apiFetch<unknown>(`/api/workouts/${id}`),
  },
}
