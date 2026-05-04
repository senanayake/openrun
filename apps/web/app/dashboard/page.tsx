'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WorkoutCard } from '@/components/WorkoutCard'
import { TrainingLoadChart } from '@/components/TrainingLoadChart'
import { formatTime } from '@/lib/mapbox'

const STUB_TODAY = {
  id: 'today-1',
  type: 'easy' as const,
  distance_km: 12.0,
  target_pace_sec_per_km: 370,
  target_hr_zone: 2,
  estimated_duration_min: 74,
  description: 'Easy 12km. Keep the effort genuinely conversational throughout. If you can\'t speak in full sentences you\'re going too fast.',
  phase: 'base' as const,
  week_number: 3,
}

const STUB_LOAD = {
  ctl: 48.2,
  atl: 52.1,
  tsb: -3.9,
  daily: [
    { date: '2026-04-21', tss: 65, ctl: 42.1, atl: 44.8, tsb: -2.7 },
    { date: '2026-04-22', tss: 0,  ctl: 41.1, atl: 38.4, tsb: 2.7  },
    { date: '2026-04-23', tss: 90, ctl: 43.2, atl: 50.6, tsb: -7.4 },
    { date: '2026-04-24', tss: 55, ctl: 43.9, atl: 51.4, tsb: -7.5 },
    { date: '2026-04-25', tss: 0,  ctl: 43.0, atl: 43.8, tsb: -0.8 },
    { date: '2026-04-26', tss: 110,ctl: 45.6, atl: 55.6, tsb: -10.0},
    { date: '2026-04-27', tss: 75, ctl: 46.8, atl: 57.2, tsb: -10.4},
    { date: '2026-04-28', tss: 0,  ctl: 45.7, atl: 48.7, tsb: -3.0 },
    { date: '2026-04-29', tss: 70, ctl: 46.4, atl: 51.2, tsb: -4.8 },
    { date: '2026-04-30', tss: 0,  ctl: 45.3, atl: 43.7, tsb: 1.6  },
    { date: '2026-05-01', tss: 65, ctl: 45.7, atl: 47.0, tsb: -1.3 },
    { date: '2026-05-02', tss: 88, ctl: 46.8, atl: 52.4, tsb: -5.6 },
    { date: '2026-05-03', tss: 0,  ctl: 45.7, atl: 44.9, tsb: 0.8  },
    { date: '2026-05-04', tss: 0,  ctl: 48.2, atl: 52.1, tsb: -3.9 },
  ],
}

function readinessStatement(tsb: number): string {
  if (tsb > 15) return "You're well rested and ready to push. Today's workout can be full effort."
  if (tsb > 5) return "Good form. You're carrying a light load — today is a quality day."
  if (tsb > -10) return "Moderate fatigue from recent training. Keep today's easy run genuinely conversational."
  if (tsb > -20) return "You're in a hard training block. Today's easy run is recovery — protect it."
  return "High fatigue. Consider whether today's session should be shortened or skipped entirely."
}

export default function DashboardPage() {
  const [weekMileage, setWeekMileage] = useState(0)
  const [weekTarget] = useState(32)

  useEffect(() => {
    // Sum last 7 days of planned distance — stub
    setWeekMileage(21.5)
  }, [])

  const next3 = [
    { day: 'Tomorrow', type: 'rest', dist: 0 },
    { day: 'Wednesday', type: 'tempo', dist: 10 },
    { day: 'Thursday', type: 'easy', dist: 8 },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-gray-900">OpenRun</span>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
          <Link href="/races" className="text-gray-500 hover:text-gray-800">Races</Link>
          <Link href="/log" className="text-gray-500 hover:text-gray-800">Log run</Link>
          <Link href="/coach" className="text-gray-500 hover:text-gray-800">Coach</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Today's workout */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Today</h2>
          <WorkoutCard workout={STUB_TODAY} />
        </section>

        {/* Readiness */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Training form</h2>
            <div className="flex gap-4 text-sm">
              <span>CTL <strong>{STUB_LOAD.ctl.toFixed(1)}</strong></span>
              <span>ATL <strong>{STUB_LOAD.atl.toFixed(1)}</strong></span>
              <span className={STUB_LOAD.tsb >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                TSB <strong>{STUB_LOAD.tsb.toFixed(1)}</strong>
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">{readinessStatement(STUB_LOAD.tsb)}</p>
          <TrainingLoadChart data={STUB_LOAD.daily} />
        </section>

        {/* Weekly progress */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-900">This week</h2>
            <span className="text-sm text-gray-500">{weekMileage} / {weekTarget} km</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((weekMileage / weekTarget) * 100, 100)}%` }}
            />
          </div>
        </section>

        {/* Next 3 days */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Coming up</h2>
          <div className="flex gap-3">
            {next3.map(d => (
              <div key={d.day} className="flex-1 bg-white rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-400">{d.day}</p>
                <p className="text-sm font-semibold capitalize mt-1">{d.type}</p>
                {d.dist > 0 && <p className="text-xs text-gray-500">{d.dist} km</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
