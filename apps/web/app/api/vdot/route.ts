import { NextRequest, NextResponse } from 'next/server'
import { calculateVdot } from '@/lib/coaching-engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { distance_km: number; time_seconds: number }
    const result = await calculateVdot(body.distance_km, body.time_seconds)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('422') ? 422 : 502
    return NextResponse.json({ detail: msg }, { status })
  }
}
