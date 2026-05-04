import { describe, test, expect } from 'vitest'

describe('POST /api/plans/rebuild', () => {
  const FUTURE_DATE = '2027-06-01'

  test('returns new plan for valid request', async () => {
    const res = await fetch('http://localhost:3000/api/plans/rebuild', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        race_id: 'twin-cities-marathon-2026',
        race_date: FUTURE_DATE,
        goal_time_seconds: 12600,
        current_vdot: 45,
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.weeks).toBeDefined()
    expect(data.weeks.length).toBeGreaterThan(0)
  })

  test('returns 422 when race date less than 3 weeks away', async () => {
    const nearDate = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0]
    const res = await fetch('http://localhost:3000/api/plans/rebuild', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        race_id: 'twin-cities-marathon-2026',
        race_date: nearDate,
        goal_time_seconds: 12600,
        current_vdot: 45,
      }),
    })
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.detail).toMatch(/3 weeks/i)
  })
})
