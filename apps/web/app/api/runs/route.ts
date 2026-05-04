import { NextRequest, NextResponse } from 'next/server'
import { calculateTss } from '@/lib/coaching-engine'
import type { RunLog, RunLogRequest } from '@/lib/types'

const runs = new Map<string, RunLog>()

export const runsStore = runs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RunLogRequest

    if (!body.distance_km || body.distance_km <= 0) {
      return NextResponse.json({ detail: 'distance_km must be positive' }, { status: 422 })
    }
    if (!body.duration_seconds || body.duration_seconds <= 0) {
      return NextResponse.json({ detail: 'duration_seconds must be positive' }, { status: 422 })
    }

    const avgPace = body.duration_seconds / body.distance_km
    const ftpSecPerKm = 276 // default FTP ≈ VDOT 45 threshold

    let tss = 0
    try {
      const result = await calculateTss({
        durationSeconds: body.duration_seconds,
        avgPaceSecPerKm: avgPace,
        ftpSecPerKm,
      })
      tss = result.tss
    } catch {
      // TSS calculation is best-effort; don't fail the run log
      tss = Math.round((body.duration_seconds / 3600) * 50)
    }

    const id = crypto.randomUUID()
    const run: RunLog = {
      id,
      date: body.date,
      planned_workout_id: body.planned_workout_id ?? null,
      distance_km: body.distance_km,
      duration_seconds: body.duration_seconds,
      avg_hr: body.avg_hr,
      perceived_effort: body.perceived_effort,
      notes: body.notes ?? '',
      tss: Math.round(tss),
    }
    runs.set(id, run)

    return NextResponse.json(run, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ detail: msg }, { status: 502 })
  }
}
