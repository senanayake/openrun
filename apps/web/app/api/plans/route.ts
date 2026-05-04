import { NextRequest, NextResponse } from 'next/server'
import { generatePlan } from '@/lib/coaching-engine'
import type { WorkoutSummary, TrainingPhase, WorkoutType } from '@/lib/types'

interface CorePlanWeek {
  week_number: number
  phase: string
  target_mileage: number
  is_recovery_week: boolean
  key_workouts: string[]
}

interface CorePlan {
  id: string
  race_id: string
  race_date: string
  weeks: CorePlanWeek[]
}

function inferWorkoutType(label: string): WorkoutType {
  const l = label.toLowerCase()
  if (l.includes('long')) return 'long'
  if (l.includes('tempo') || l.includes('threshold')) return 'tempo'
  if (l.includes('interval') || l.includes('speed') || l.includes('repeat')) return 'interval'
  if (l.includes('rest') || l.includes('off')) return 'rest'
  return 'easy'
}

function buildWorkouts(week: CorePlanWeek): WorkoutSummary[] {
  const types = week.key_workouts.map(inferWorkoutType)
  // Distribute target_mileage across sessions (easy gets ~40%, long ~35%, quality ~25%)
  const totalKm = week.target_mileage

  return types.map((type, i) => {
    const fraction =
      type === 'long' ? 0.35 :
      type === 'easy' ? 0.40 / Math.max(types.filter(t => t === 'easy').length, 1) :
      0.25 / Math.max(types.filter(t => t !== 'easy' && t !== 'long').length, 1)

    const distanceKm = parseFloat((totalKm * fraction).toFixed(1))
    const paceSecPerKm = type === 'easy' ? 380 : type === 'tempo' ? 310 : type === 'long' ? 365 : 285

    return {
      id: `${week.week_number}-${i}`,
      type,
      date: '',
      distance_km: distanceKm,
      target_pace_sec_per_km: paceSecPerKm,
      target_hr_zone: type === 'easy' ? 2 : type === 'long' ? 2 : 4,
      estimated_duration_min: Math.round((distanceKm * paceSecPerKm) / 60),
      description: week.key_workouts[i] ?? '',
      phase: week.phase as TrainingPhase,
      week_number: week.week_number,
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      raceId: string
      raceDate: string
      goalTimeSeconds: number
      currentVdot: number
      currentWeeklyMileage: number
    }

    const corePlan = await generatePlan({
      raceId: body.raceId,
      raceDate: body.raceDate,
      startDate: new Date().toISOString().split('T')[0]!,
      currentVdot: body.currentVdot,
      currentWeeklyMileage: body.currentWeeklyMileage,
    }) as unknown as CorePlan

    const plan = {
      id: corePlan.id,
      race_id: corePlan.race_id,
      weeks: (corePlan.weeks as CorePlanWeek[]).map(w => ({
        week_number: w.week_number,
        phase: w.phase as TrainingPhase,
        total_km: w.target_mileage,
        workouts: buildWorkouts(w),
      })),
    }

    return NextResponse.json(plan)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('422') ? 422 : 502
    return NextResponse.json({ detail: msg }, { status })
  }
}
