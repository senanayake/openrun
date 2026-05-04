import { NextRequest, NextResponse } from 'next/server'
import { generatePlan } from '@/lib/coaching-engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      planId: string
      newStartDate: string
      currentVdot: number
      currentWeeklyMileage: number
      raceDate: string
      raceId: string
    }

    // Validate: race must be at least 3 weeks away from new start
    const start = new Date(body.newStartDate)
    const race = new Date(body.raceDate)
    const weeksAway = (race.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000)
    if (weeksAway < 3) {
      return NextResponse.json(
        { detail: 'Race date must be at least 3 weeks away' },
        { status: 422 }
      )
    }

    const newPlan = await generatePlan({
      raceId: body.raceId,
      raceDate: body.raceDate,
      startDate: body.newStartDate,
      currentVdot: body.currentVdot,
      currentWeeklyMileage: body.currentWeeklyMileage,
    })

    return NextResponse.json({ new_plan: newPlan, diff: { removed_weeks: [], adjusted_mileage: [] } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('422') ? 422 : 502
    return NextResponse.json({ detail: msg }, { status })
  }
}
