import Link from 'next/link'
import type { Race } from '@/lib/types'

interface RaceCardProps {
  race: Race
}

export function RaceCard({ race }: RaceCardProps) {
  const difficultyLabel = race.elevation_gain_m < 100 ? 'Flat' : race.elevation_gain_m < 300 ? 'Rolling' : 'Hilly'
  const difficultyColour =
    race.elevation_gain_m < 100 ? 'bg-emerald-100 text-emerald-700' :
    race.elevation_gain_m < 300 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  const formattedDate = new Date(race.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Link href={`/races/${race.id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 leading-tight">{race.name}</h3>
          <div className="flex gap-1.5 ml-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColour}`}>
              {difficultyLabel}
            </span>
            {race.bq_qualifier && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">BQ</span>
            )}
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-500">
          <p>{formattedDate}</p>
          <p>{race.distance_km} km · {race.start.city} to {race.finish.city}</p>
          {race.elevation_gain_m > 0 && (
            <p>+{race.elevation_gain_m} m / -{race.elevation_loss_m} m</p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="capitalize text-xs text-gray-400">{race.course_type} course</span>
          <span className="text-blue-600 text-sm font-medium">View →</span>
        </div>
      </div>
    </Link>
  )
}
