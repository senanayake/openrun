'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { PaceBandTable } from '@/components/PaceBandTable'
import { ElevationChart } from '@/components/ElevationChart'
import { formatTime, formatPace } from '@/lib/mapbox'
import type { Race, PaceBandsResponse } from '@/lib/types'

const CourseMap = dynamic(() => import('@/components/CourseMap'), { ssr: false })

export default function RaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [race, setRace] = useState<Race | null>(null)
  const [paceBands, setPaceBands] = useState<PaceBandsResponse | null>(null)
  const [goalSecs, setGoalSecs] = useState(0)

  useEffect(() => {
    fetch(`/api/races/${id}`).then(r => r.json()).then((r: Race) => {
      setRace(r)
      const stored = localStorage.getItem('onboarding_goal_secs')
      if (stored) setGoalSecs(parseInt(stored))
    })
  }, [id])

  useEffect(() => {
    if (!goalSecs) return
    fetch(`/api/races/${id}/pace-bands?goal_time_seconds=${goalSecs}`)
      .then(r => r.json())
      .then(setPaceBands)
  }, [id, goalSecs])

  if (!race) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </main>
    )
  }

  const difficultyLabel = race.elevation_gain_m < 100 ? 'Flat' : race.elevation_gain_m < 300 ? 'Rolling' : 'Hilly'
  const difficultyColour = race.elevation_gain_m < 100 ? 'bg-emerald-100 text-emerald-700' : race.elevation_gain_m < 300 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <Link href="/races" className="text-sm text-blue-600 hover:underline">← All races</Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{race.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {race.distance_km} km · {new Date(race.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColour}`}>{difficultyLabel}</span>
            {race.bq_qualifier && <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">BQ Qualifier</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Course map */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-72">
            <CourseMap race={race} />
          </div>
        </div>

        {/* Elevation profile */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Elevation profile</h2>
          <ElevationChart profile={race.elevation_profile} />
          <div className="flex gap-6 mt-4 text-sm text-gray-600">
            <span>Gain: <strong>+{race.elevation_gain_m} m</strong></span>
            <span>Loss: <strong>-{race.elevation_loss_m} m</strong></span>
            <span>Factor: <strong>{race.elevation_adjustment_factor.toFixed(3)}</strong></span>
          </div>
        </div>

        {/* Course stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Distance', value: `${race.distance_km} km` },
            { label: 'Race date', value: new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            { label: 'Course type', value: race.course_type },
            { label: 'Start', value: race.start.city },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="font-semibold text-gray-900 mt-1 capitalize">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Course segments */}
        {race.segments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Course segments</h2>
            <div className="space-y-2">
              {race.segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{seg.name}</p>
                    <p className="text-xs text-gray-500">{seg.start_km}–{seg.end_km} km · {seg.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    seg.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                    seg.difficulty === 'moderate' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {seg.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pace bands */}
        {paceBands ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Pace bands</h2>
              <span className="text-sm text-gray-500">Goal: {formatTime(goalSecs)}</span>
            </div>
            <PaceBandTable bands={paceBands.bands} />
          </div>
        ) : goalSecs > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center text-gray-500 text-sm">
            Loading pace bands…
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="text-sm text-blue-700">
              Complete onboarding to see personalised pace bands for this race.{' '}
              <Link href="/onboarding/fitness" className="underline font-medium">Get started →</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
