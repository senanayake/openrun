import Link from 'next/link'
import { formatPace } from '@/lib/mapbox'

interface WorkoutCardProps {
  workout: {
    id: string
    type: string
    distance_km: number
    target_pace_sec_per_km: number
    target_hr_zone: number
    estimated_duration_min: number
    description: string
    phase: string
    week_number: number
  }
}

const PHASE_COLOURS: Record<string, string> = {
  base: 'bg-blue-100 text-blue-700',
  support: 'bg-purple-100 text-purple-700',
  specific: 'bg-amber-100 text-amber-700',
  taper: 'bg-emerald-100 text-emerald-700',
}

const TYPE_COLOURS: Record<string, string> = {
  easy: 'bg-emerald-50 border-emerald-200',
  tempo: 'bg-amber-50 border-amber-200',
  long: 'bg-blue-50 border-blue-200',
  interval: 'bg-red-50 border-red-200',
  race: 'bg-purple-50 border-purple-200',
  rest: 'bg-gray-50 border-gray-200',
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const colourClass = TYPE_COLOURS[workout.type] ?? 'bg-white border-gray-200'
  const phaseColour = PHASE_COLOURS[workout.phase] ?? 'bg-gray-100 text-gray-600'

  return (
    <Link href={`/workout/${workout.id}`} className="block">
      <div className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${colourClass}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="capitalize font-semibold text-gray-900">{workout.type} run</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phaseColour}`}>
                {workout.phase}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{workout.distance_km} km</p>
            <p className="text-sm text-gray-500 mt-0.5">
              ~{workout.estimated_duration_min} min · {formatPace(workout.target_pace_sec_per_km)} /km · Zone {workout.target_hr_zone}
            </p>
          </div>
          <span className="text-gray-400 text-lg">→</span>
        </div>
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{workout.description}</p>
      </div>
    </Link>
  )
}
