'use client'

import { useEffect, useState } from 'react'
import { RaceCard } from '@/components/RaceCard'
import type { Race } from '@/lib/types'

export default function RacesPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'bq' | 'flat' | 'hilly'>('all')

  useEffect(() => {
    fetch('/api/races').then(r => r.json()).then(setRaces)
  }, [])

  const filtered = races.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'bq' ? r.bq_qualifier :
      filter === 'flat' ? r.elevation_gain_m < 100 :
      r.elevation_gain_m >= 100
    return matchesSearch && matchesFilter
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Races</h1>
        <p className="text-sm text-gray-500 mt-1">Browse target races and explore course profiles.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="Search races…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {(['all', 'bq', 'flat', 'hilly'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'All' : f === 'bq' ? 'BQ' : f === 'flat' ? 'Flat' : 'Hilly'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No races match your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(race => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
