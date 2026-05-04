import { describe, test, expect } from 'vitest'

describe('POST /api/coach', () => {
  test('streams SSE response', async () => {
    const res = await fetch('http://localhost:3000/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': `test-${Date.now()}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What is Zone 2 training?' }],
      }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
  })

  test('returns 429 after rate limit exceeded', async () => {
    const userId = `test-ratelimit-${Date.now()}`
    const headers = { 'Content-Type': 'application/json', 'x-user-id': userId }
    const body = JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }] })

    // consume all 20 requests
    for (let i = 0; i < 20; i++) {
      await fetch('http://localhost:3000/api/coach', { method: 'POST', headers, body })
    }

    const res = await fetch('http://localhost:3000/api/coach', { method: 'POST', headers, body })
    expect(res.status).toBe(429)
  }, 60000)

  test('returns 400 for empty messages', async () => {
    const res = await fetch('http://localhost:3000/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'test-empty' },
      body: JSON.stringify({ messages: [] }),
    })
    expect(res.status).toBe(400)
  })
})
