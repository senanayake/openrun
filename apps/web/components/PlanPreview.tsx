'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { TrainingPlan, PlanWeek, WorkoutSummary } from '@/lib/types'
import { formatPace } from '@/lib/mapbox'

interface PlanPreviewProps {
  plan: TrainingPlan
}

const PHASE_COLOURS: Record<string, string> = {
  base: 'bg-blue-100 border-blue-200 text-blue-800',
  support: 'bg-purple-100 border-purple-200 text-purple-800',
  specific: 'bg-amber-100 border-amber-200 text-amber-800',
  taper: 'bg-emerald-100 border-emerald-200 text-emerald-800',
}

const TYPE_DOTS: Record<string, string> = {
  easy: 'bg-emerald-400',
  tempo: 'bg-amber-400',
  long: 'bg-blue-500',
  interval: 'bg-red-500',
  race: 'bg-purple-500',
  rest: 'bg-gray-300',
}

function WeekRow({ week, isSelected, onSelect }: { week: PlanWeek; isSelected: boolean; onSelect: () => void }) {
  const phaseColour = PHASE_COLOURS[week.phase] ?? 'bg-gray-100 border-gray-200 text-gray-700'
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border p-3 transition-all ${isSelected ? phaseColour : 'bg-white border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">W{week.week_number}</span>
          <div className="flex gap-1">
            {week.workouts.map((w, i) => (
              <span
                key={i}
                title={`${w.type} — ${w.distance_km} km`}
                className={`w-2 h-2 rounded-full ${TYPE_DOTS[w.type] ?? 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs font-semibold">{week.total_km} km</span>
      </div>
    </div>
  )
}

function WorkoutPill({ workout }: { workout: WorkoutSummary }) {
  return (
    <Link href={`/workout/${workout.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-900 capitalize">{workout.type}</p>
            <p className="text-xs text-gray-500">{workout.distance_km} km</p>
          </div>
          <p className="text-xs font-mono text-gray-600">{formatPace(workout.target_pace_sec_per_km)}/km</p>
        </div>
      </div>
    </Link>
  )
}

export function PlanPreview({ plan }: PlanPreviewProps) {
  const [selectedWeek, setSelectedWeek] = useState<PlanWeek | null>(plan.weeks[0] ?? null)

  return (
    <div className="space-y-4">
      {/* Swimlane — scrollable week grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
          {plan.weeks.map(week => (
            <WeekRow
              key={week.week_number}
              week={week}
              isSelected={selectedWeek?.week_number === week.week_number}
              onSelect={() => setSelectedWeek(week)}
            />
          ))}
        </div>
      </div>

      {/* Selected week detail */}
      {selectedWeek && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Week {selectedWeek.week_number} — <span className="capitalize">{selectedWeek.phase}</span>
            </h3>
            <span className="text-sm text-gray-500">{selectedWeek.total_km} km total</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedWeek.workouts.map((w, i) => (
              <WorkoutPill key={i} workout={w} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
