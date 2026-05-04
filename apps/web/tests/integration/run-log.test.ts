import { describe, test, expect } from 'vitest'

describe('POST /api/runs', () => {
  test('creates a run and returns 201 with id', async () => {
    const res = await fetch('http://localhost:3000/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-05-04',
        distance_km: 12.0,
        duration_seconds: 4440,
        avg_hr: 145,
        perceived_effort: 3,
        notes: 'Felt strong',
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBeDefined()
    expect(data.tss).toBeGreaterThan(0)
  })

  test('returns 422 for missing distance', async () => {
    const res = await fetch('http://localhost:3000/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-05-04', duration_seconds: 3600 }),
    })
    expect(res.status).toBe(422)
  })

  test('GET /api/runs/[id] returns logged run', async () => {
    const createRes = await fetch('http://localhost:3000/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-05-04',
        distance_km: 10,
        duration_seconds: 3600,
        perceived_effort: 2,
        notes: '',
      }),
    })
    const { id } = await createRes.json()

    const getRes = await fetch(`http://localhost:3000/api/runs/${id}`)
    expect(getRes.status).toBe(200)
    const run = await getRes.json()
    expect(run.distance_km).toBe(10)
  })
})
