'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { formatPace } from '@/lib/mapbox'

const CourseMap = dynamic(() => import('@/components/CourseMap'), { ssr: false })

interface WorkoutStep {
  label: string
  distance_km: number
  pace_sec_per_km: number
  zone: number
}

interface WorkoutDetail {
  id: string
  type: string
  date: string
  distance_km: number
  target_pace_sec_per_km: number
  target_hr_zone: number
  estimated_duration_min: number
  description: string
  steps: WorkoutStep[]
  research_citation: { title: string; authors: string; year: number; key_finding: string }
  phase: string
  week_number: number
}

const ZONE_LABELS = ['', 'Recovery', 'Aerobic', 'Tempo / MP', 'Threshold', 'VO₂max']
const ZONE_COLOURS = ['', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700']

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/workouts/${id}`).then(r => r.json()).then(setWorkout)
  }, [id])

  if (!workout) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <p className="text-sm text-gray-500">Week {workout.week_number} · {workout.phase}</p>
        <h1 className="text-2xl font-bold text-gray-900 capitalize mt-1">
          {workout.type} run — {workout.distance_km} km
        </h1>
        <p className="text-sm text-gray-500 mt-1">~{workout.estimated_duration_min} min · {formatPace(workout.target_pace_sec_per_km)} /km target</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-gray-700">{workout.description}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Workout structure</h2>
          {workout.steps.map((step, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{step.label}</p>
                  <p className="text-sm text-gray-500">{step.distance_km} km</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{formatPace(step.pace_sec_per_km)} /km</p>
                  <span className={`text-xs rounded px-2 py-0.5 ${ZONE_COLOURS[step.zone]}`}>
                    Zone {step.zone} — {ZONE_LABELS[step.zone]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setExpanded(expanded === `z${i}` ? null : `z${i}`)}
                className="text-xs text-blue-600 mt-2 hover:underline"
              >
                What does Zone {step.zone} mean?
              </button>
              {expanded === `z${i}` && (
                <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">
                  {step.zone === 1 && 'Very light effort. Breathing is effortless. Used for warm-up and cool-down.'}
                  {step.zone === 2 && 'Aerobic base zone. You should be able to hold a full conversation. This is where fitness is built.'}
                  {step.zone === 3 && 'Moderate effort. Comfortably uncomfortable. Marathon race pace falls here.'}
                  {step.zone === 4 && 'Hard effort. Threshold pace — you can speak a few words, not sentences.'}
                  {step.zone === 5 && 'Maximum effort. VO₂max intervals. Not sustainable beyond 5–8 minutes.'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Research citation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Science behind this workout</p>
          <p className="text-sm text-gray-700">{workout.research_citation.key_finding}</p>
          <p className="text-xs text-gray-500 mt-2">
            {workout.research_citation.authors} ({workout.research_citation.year}). {workout.research_citation.title}
          </p>
        </div>
      </div>
    </main>
  )
}
