import { http, HttpResponse } from 'msw'

const STUB_VDOT_RESPONSE = {
  vdot: 48.5,
  vo2max: 48.5,
  marathon_seconds: 11400,
  half_marathon_seconds: 5340,
  k10_seconds: 2460,
  k5_seconds: 1200,
  pace_zones: [
    { zone: 1, name: 'Recovery', min_pace_sec_per_km: 390, max_pace_sec_per_km: 430, color: '#3b82f6' },
    { zone: 2, name: 'Aerobic', min_pace_sec_per_km: 360, max_pace_sec_per_km: 390, color: '#10b981' },
    { zone: 3, name: 'Tempo', min_pace_sec_per_km: 330, max_pace_sec_per_km: 360, color: '#f59e0b' },
    { zone: 4, name: 'Threshold', min_pace_sec_per_km: 305, max_pace_sec_per_km: 330, color: '#f97316' },
    { zone: 5, name: 'VO2max', min_pace_sec_per_km: 270, max_pace_sec_per_km: 305, color: '#ef4444' },
  ],
}

const STUB_RACE = {
  id: 'twin-cities-marathon-2026',
  name: 'Twin Cities Marathon 2026',
  distance_km: 42.195,
  date: '2026-10-04',
  bq_qualifier: true,
  elevation_gain_m: 52,
  elevation_loss_m: 75,
  elevation_adjustment_factor: 0.98,
  course_type: 'point-to-point',
  start: { name: 'US Bank Stadium', city: 'Minneapolis', lat: 44.9738, lng: -93.2575 },
  finish: { name: 'Minnesota State Capitol', city: 'St. Paul', lat: 44.9549, lng: -93.1022 },
  segments: [],
  elevation_profile: [],
}

const STUB_PLAN = {
  id: 'plan-1',
  race_id: 'twin-cities-marathon-2026',
  weeks: Array.from({ length: 22 }, (_, i) => ({
    week_number: i + 1,
    phase: i < 6 ? 'base' : i < 12 ? 'support' : i < 19 ? 'specific' : 'taper',
    total_km: 40 + i * 2,
    workouts: [
      { id: `w-${i}-1`, type: 'easy', date: '2026-05-11', distance_km: 10, target_pace_sec_per_km: 380, target_hr_zone: 2, estimated_duration_min: 63, description: 'Easy run', phase: 'base', week_number: i + 1 },
    ],
  })),
}

export const handlers = [
  http.post('/api/vdot', () => HttpResponse.json(STUB_VDOT_RESPONSE)),

  http.post('/api/plans', () => HttpResponse.json(STUB_PLAN)),

  http.get('/api/races', () => HttpResponse.json([STUB_RACE])),

  http.get('/api/races/:id', () => HttpResponse.json(STUB_RACE)),

  http.get('/api/races/:id/pace-bands', () =>
    HttpResponse.json({
      bands: [
        { label: '0–10 km', start_km: 0, end_km: 10, target_pace_sec_per_km: 325, zone: 3, note: 'Settle in' },
        { label: '10–32 km', start_km: 10, end_km: 32, target_pace_sec_per_km: 320, zone: 3, note: 'Hold effort' },
        { label: '32–42 km', start_km: 32, end_km: 42, target_pace_sec_per_km: 315, zone: 3, note: 'Race to finish' },
      ],
    })
  ),

  http.post('/api/runs', () =>
    HttpResponse.json({
      id: 'run-stub-1',
      date: '2026-05-04',
      distance_km: 12,
      duration_seconds: 4440,
      avg_hr: 145,
      perceived_effort: 3,
      notes: '',
      tss: 55,
      planned_workout_id: null,
    }, { status: 201 })
  ),

  http.get('/api/runs/:id', () =>
    HttpResponse.json({
      id: 'run-stub-1',
      date: '2026-05-04',
      planned_workout_id: null,
      distance_km: 12,
      duration_seconds: 4440,
      avg_hr: 145,
      perceived_effort: 3,
      notes: 'Felt good',
      tss: 55,
    })
  ),

  http.get('/api/workouts/:id', () =>
    HttpResponse.json({
      id: 'w-stub-1',
      type: 'easy',
      date: '2026-05-04',
      distance_km: 12,
      target_pace_sec_per_km: 380,
      target_hr_zone: 2,
      estimated_duration_min: 76,
      description: 'Easy aerobic run.',
      steps: [
        { label: 'Warm-up', distance_km: 2, pace_sec_per_km: 400, zone: 1 },
        { label: 'Main', distance_km: 8, pace_sec_per_km: 380, zone: 2 },
        { label: 'Cool-down', distance_km: 2, pace_sec_per_km: 400, zone: 1 },
      ],
      research_citation: { title: 'Aerobic base training', authors: 'Daniels J', year: 2004, key_finding: 'Zone 2 develops aerobic capacity.' },
      phase: 'base',
      week_number: 3,
    })
  ),

  http.post('/api/plans/rebuild', () => HttpResponse.json(STUB_PLAN)),
]
