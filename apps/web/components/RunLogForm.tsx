'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface RunLogFormProps {
  onSuccess: (runId: string) => void
  plannedWorkoutId?: string
}

const EFFORT_LABELS = ['', 'Very easy', 'Easy', 'Moderate', 'Hard', 'Very hard', 'Maximum']

export function RunLogForm({ onSuccess, plannedWorkoutId }: RunLogFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [distanceKm, setDistanceKm] = useState('')
  const [durationHours, setDurationHours] = useState('0')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('00')
  const [avgHr, setAvgHr] = useState('')
  const [effort, setEffort] = useState(3)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalSeconds =
    parseInt(durationHours || '0') * 3600 +
    parseInt(durationMinutes || '0') * 60 +
    parseInt(durationSeconds || '0')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!distanceKm || !durationMinutes) {
      setError('Distance and duration are required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const run = await api.runs.log({
        date,
        distance_km: parseFloat(distanceKm),
        duration_seconds: totalSeconds,
        avg_hr: avgHr ? parseInt(avgHr) : undefined,
        perceived_effort: effort,
        notes,
        planned_workout_id: plannedWorkoutId,
      })
      onSuccess(run.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log run.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          placeholder="12.0"
          value={distanceKm}
          onChange={e => setDistanceKm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
        <div className="flex gap-2">
          {[
            { label: 'Hours', value: durationHours, set: setDurationHours },
            { label: 'Minutes', value: durationMinutes, set: setDurationMinutes, placeholder: '00' },
            { label: 'Seconds', value: durationSeconds, set: setDurationSeconds, placeholder: '00' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="flex-1">
              <input
                type="number"
                min="0"
                max={label === 'Hours' ? '24' : '59'}
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
                className="w-full text-center rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-center text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Average HR (optional)</label>
        <input
          type="number"
          min="60"
          max="220"
          placeholder="145"
          value={avgHr}
          onChange={e => setAvgHr(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Perceived effort — {EFFORT_LABELS[effort]}
        </label>
        <input
          type="range"
          min="1"
          max="6"
          value={effort}
          onChange={e => setEffort(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Very easy</span>
          <span>Maximum</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          rows={3}
          placeholder="How did it feel? Any issues?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
      >
        {submitting ? 'Saving…' : 'Log run'}
      </button>
    </form>
  )
}
