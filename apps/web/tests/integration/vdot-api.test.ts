import { describe, test, expect } from 'vitest'

describe('POST /api/vdot', () => {
  test('returns VDOT for valid distance and time', async () => {
    const res = await fetch('http://localhost:3000/api/vdot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 42.195, time_seconds: 11400 }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.vdot).toBeGreaterThan(40)
    expect(data.pace_zones).toHaveLength(5)
    expect(data.marathon_seconds).toBeGreaterThan(0)
  })

  test('returns 422 for zero distance', async () => {
    const res = await fetch('http://localhost:3000/api/vdot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 0, time_seconds: 3600 }),
    })
    expect(res.status).toBe(422)
  })

  test('returns 422 for zero time', async () => {
    const res = await fetch('http://localhost:3000/api/vdot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 10, time_seconds: 0 }),
    })
    expect(res.status).toBe(422)
  })

  test('pace zones cover full range without gaps', async () => {
    const res = await fetch('http://localhost:3000/api/vdot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 10, time_seconds: 2460 }),
    })
    const data = await res.json()
    const zones = data.pace_zones as { min_pace_sec_per_km: number; max_pace_sec_per_km: number }[]
    for (let i = 0; i < zones.length - 1; i++) {
      expect(zones[i + 1].min_pace_sec_per_km).toBeLessThanOrEqual(zones[i].max_pace_sec_per_km)
    }
  })
})
