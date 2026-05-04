'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { WorkoutSummary } from '@/lib/types'

interface TrainingCalendarProps {
  workouts: WorkoutSummary[]
}

const TYPE_COLOURS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  tempo: 'bg-amber-100 text-amber-700',
  long: 'bg-blue-100 text-blue-700',
  interval: 'bg-red-100 text-red-700',
  race: 'bg-purple-100 text-purple-700',
  rest: 'bg-gray-100 text-gray-500',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function TrainingCalendar({ workouts }: TrainingCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const workoutsByDate: Record<string, WorkoutSummary[]> = {}
  for (const w of workouts) {
    const d = w.date.split('T')[0]
    if (!workoutsByDate[d]) workoutsByDate[d] = []
    workoutsByDate[d].push(w)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function navigate(delta: number) {
    const d = new Date(viewYear, viewMonth + delta)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          ←
        </button>
        <h2 className="font-semibold text-gray-900">{monthName}</h2>
        <button onClick={() => navigate(1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayWorkouts = workoutsByDate[dateStr] ?? []
          const isToday = dateStr === today.toISOString().split('T')[0]

          return (
            <div
              key={day}
              className={`min-h-[48px] rounded-lg p-1 ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <p className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>{day}</p>
              {dayWorkouts.slice(0, 2).map((w, j) => (
                <Link key={j} href={`/workout/${w.id}`}>
                  <span className={`block text-xs rounded px-1 py-0.5 mb-0.5 truncate ${TYPE_COLOURS[w.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {w.distance_km > 0 ? `${w.distance_km}k` : w.type}
                  </span>
                </Link>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
