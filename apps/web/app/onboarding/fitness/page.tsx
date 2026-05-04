'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { PaceZoneBar } from '@/components/PaceZoneBar'
import type { VdotApiResponse } from '@/lib/types'
import { formatTime } from '@/lib/mapbox'

export default function FitnessPage() {
  const router = useRouter()
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [distance, setDistance] = useState('21.0975')
  const [result, setResult] = useState<VdotApiResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function calculate() {
    setError('')
    setLoading(true)
    try {
      const distKm = parseFloat(distance)
      const timeSec =
        (parseInt(hours || '0') * 3600) +
        (parseInt(minutes || '0') * 60) +
        parseInt(seconds || '0')
      if (!distKm || !timeSec) {
        setError('Enter a valid distance and time.')
        return
      }
      const data = await api.vdot.calculate(distKm, timeSec)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Step 1 of 4</p>
          <h1 className="text-3xl font-bold text-gray-900">What's your current fitness?</h1>
          <p className="mt-2 text-gray-500">
            Enter a recent race result. We'll calculate your VDOT — the single number that captures your aerobic fitness.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Race distance</label>
            <select
              value={distance}
              onChange={e => setDistance(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="21.0975">Half marathon (21.1 km)</option>
              <option value="42.195">Marathon (42.2 km)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finish time</label>
            <div className="flex gap-2">
              {[
                { label: 'HH', value: hours, set: setHours, max: 9 },
                { label: 'MM', value: minutes, set: setMinutes, max: 59 },
                { label: 'SS', value: seconds, set: setSeconds, max: 59 },
              ].map(({ label, value, set, max }) => (
                <div key={label} className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max={max}
                    placeholder={label}
                    value={value}
                    onChange={e => set(e.target.value)}
                    className="w-full text-center rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-center text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={calculate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
          >
            {loading ? 'Calculating…' : 'Calculate my fitness'}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-5xl font-bold text-blue-600">{result.vdot.toFixed(1)}</span>
                <span className="text-lg text-gray-500">VDOT</span>
              </div>
              <p className="text-gray-700">
                You're equivalent to a{' '}
                <strong>{formatTime(result.marathon_seconds)} marathoner</strong> right now.
                That's your aerobic ceiling — train smart for 22 weeks and you'll raise it.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Your training zones</h2>
              <PaceZoneBar zones={result.pace_zones} />
            </div>

            <button
              onClick={() => {
                localStorage.setItem('onboarding_vdot', result.vdot.toString())
                localStorage.setItem('onboarding_marathon_secs', result.marathon_seconds.toString())
                router.push('/onboarding/race')
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              Continue — choose my race →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
