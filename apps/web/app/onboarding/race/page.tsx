'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api'
import type { Race } from '@/lib/types'

const CourseMap = dynamic(() => import('@/components/CourseMap'), { ssr: false })

export default function RacePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [races, setRaces] = useState<Race[]>([])
  const [filtered, setFiltered] = useState<Race[]>([])
  const [selected, setSelected] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.races.list().then(r => {
      setRaces(r)
      setFiltered(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(races.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.start.city.toLowerCase().includes(q)
    ))
  }, [query, races])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Step 2 of 4</p>
          <h1 className="text-3xl font-bold text-gray-900">Choose your target race</h1>
          <p className="mt-2 text-gray-500">Search by name or city. We'll build your plan around the course.</p>
        </div>

        <input
          type="text"
          placeholder="Search races…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {loading && <p className="text-gray-400 text-sm">Loading races…</p>}

        <div className="space-y-3">
          {filtered.map(race => (
            <button
              key={race.id}
              onClick={() => setSelected(race)}
              className={`w-full text-left bg-white rounded-xl border p-4 transition-colors hover:border-blue-400 ${
                selected?.id === race.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{race.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(race.date)} · {race.distance_km} km ·{' '}
                    {race.start.city}, {race.start.state}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {race.bq_qualifier && (
                    <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-medium">BQ</span>
                  )}
                  <span className={`text-xs rounded px-2 py-0.5 font-medium ${
                    race.course_difficulty_rating === 'hard' ? 'bg-red-100 text-red-700' :
                    race.course_difficulty_rating?.includes('moderate') ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {race.course_difficulty_rating ?? 'moderate'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-64">
                <CourseMap race={selected} interactive={false} />
              </div>
              <div className="p-4">
                <p className="font-semibold">{selected.name}</p>
                <p className="text-sm text-gray-500">{formatDate(selected.date)}</p>
                <p className="text-sm text-gray-600 mt-2">{selected.notes}</p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('onboarding_race_id', selected.id)
                localStorage.setItem('onboarding_race_date', selected.date)
                localStorage.setItem('onboarding_race_name', selected.name)
                router.push('/onboarding/goal')
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              Train for {selected.name} →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
