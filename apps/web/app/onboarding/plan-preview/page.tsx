'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { PlanPreview } from '@/components/PlanPreview'
import type { TrainingPlan } from '@/lib/types'

export default function PlanPreviewPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const vdot = parseFloat(localStorage.getItem('onboarding_vdot') ?? '0')
    const raceId = localStorage.getItem('onboarding_race_id') ?? ''
    const raceDate = localStorage.getItem('onboarding_race_date') ?? ''
    const goalSecs = parseInt(localStorage.getItem('onboarding_goal_secs') ?? '0')

    if (!vdot || !raceId || !raceDate) {
      router.push('/onboarding/fitness')
      return
    }

    api.plans.generate({
      raceId,
      raceDate,
      goalTimeSeconds: goalSecs,
      currentVdot: vdot,
      currentWeeklyMileage: 30,
    })
      .then(p => { setPlan(p); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [router])

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Step 4 of 4</p>
          <h1 className="text-3xl font-bold text-gray-900">Your 22-week plan</h1>
          <p className="mt-2 text-gray-500">
            Built around your fitness, your race, and your goal. Colour shows training phase.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Building your plan…</p>
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        {plan && (
          <div className="space-y-6">
            <PlanPreview plan={plan} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Base', weeks: '1–6', colour: 'bg-blue-100 text-blue-700', desc: 'Easy miles, aerobic foundation' },
                { label: 'Support', weeks: '7–12', colour: 'bg-purple-100 text-purple-700', desc: 'Intervals, threshold work' },
                { label: 'Specific', weeks: '13–19', colour: 'bg-amber-100 text-amber-700', desc: 'Race-pace running, hills' },
                { label: 'Taper', weeks: '20–22', colour: 'bg-emerald-100 text-emerald-700', desc: 'Freshen up, race ready' },
              ].map(p => (
                <div key={p.label} className={`rounded-xl p-3 ${p.colour}`}>
                  <p className="font-semibold">{p.label}</p>
                  <p className="text-xs opacity-80">Weeks {p.weeks}</p>
                  <p className="text-xs mt-1 opacity-70">{p.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.setItem('onboarding_complete', '1')
                router.push('/dashboard')
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-4 text-lg transition-colors"
            >
              Confirm and start training →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
