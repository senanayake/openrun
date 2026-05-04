'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatTime } from '@/lib/mapbox'

export default function GoalPage() {
  const router = useRouter()
  const [goalHours, setGoalHours] = useState('3')
  const [goalMinutes, setGoalMinutes] = useState('45')
  const [goalSeconds, setGoalSeconds] = useState('00')
  const [currentVdot, setCurrentVdot] = useState(0)
  const [currentMarathonSecs, setCurrentMarathonSecs] = useState(0)
  const [raceName, setRaceName] = useState('')
  const [raceDate, setRaceDate] = useState('')

  useEffect(() => {
    setCurrentVdot(parseFloat(localStorage.getItem('onboarding_vdot') ?? '0'))
    setCurrentMarathonSecs(parseInt(localStorage.getItem('onboarding_marathon_secs') ?? '0'))
    setRaceName(localStorage.getItem('onboarding_race_name') ?? '')
    setRaceDate(localStorage.getItem('onboarding_race_date') ?? '')
  }, [])

  const goalSecs =
    parseInt(goalHours) * 3600 + parseInt(goalMinutes) * 60 + parseInt(goalSeconds)

  const weeksAvailable = raceDate
    ? Math.floor((new Date(raceDate).getTime() - Date.now()) / (7 * 24 * 3600 * 1000))
    : 0

  const improvementNeeded = currentMarathonSecs > 0
    ? ((currentMarathonSecs - goalSecs) / currentMarathonSecs) * 100
    : 0

  const isUnrealistic = improvementNeeded > 15 && weeksAvailable < 22

  function getInsight() {
    if (!currentMarathonSecs || !goalSecs) return null
    const diffMin = Math.round((currentMarathonSecs - goalSecs) / 60)
    if (diffMin <= 0) return { type: 'easy' as const, msg: `Your goal is already within reach — you're currently predicted at ${formatTime(currentMarathonSecs)}. Focus on executing the race perfectly.` }
    if (diffMin <= 10) return { type: 'achievable' as const, msg: `A ${diffMin}-minute improvement in ${weeksAvailable} weeks is very achievable with consistent training.` }
    if (diffMin <= 20) return { type: 'challenging' as const, msg: `A ${diffMin}-minute improvement is ambitious — it requires building significant aerobic base in ${weeksAvailable} weeks. Commit fully.` }
    return { type: 'stretch' as const, msg: `A ${diffMin}-minute improvement is a stretch goal. It's possible, but requires everything to go right.` }
  }

  const insight = getInsight()

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Step 3 of 4</p>
          <h1 className="text-3xl font-bold text-gray-900">Set your goal time</h1>
          <p className="mt-2 text-gray-500">
            {raceName ? `What's your target for ${raceName}?` : 'What finish time are you targeting?'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal finish time</label>
            <div className="flex gap-2">
              {[
                { label: 'Hours', value: goalHours, set: setGoalHours },
                { label: 'Minutes', value: goalMinutes, set: setGoalMinutes },
                { label: 'Seconds', value: goalSeconds, set: setGoalSeconds },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={e => set(e.target.value.padStart(2, '0'))}
                    className="w-full text-center text-2xl font-bold rounded-lg border border-gray-300 px-2 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-center text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Current prediction</p>
              <p className="font-semibold">{currentMarathonSecs ? formatTime(currentMarathonSecs) : '—'}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Your goal</p>
              <p className="font-semibold text-blue-700">{formatTime(goalSecs)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Weeks available</p>
              <p className="font-semibold">{weeksAvailable} weeks</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Improvement needed</p>
              <p className="font-semibold">{improvementNeeded > 0 ? `${improvementNeeded.toFixed(1)}%` : 'Already there'}</p>
            </div>
          </div>

          {insight && (
            <div className={`rounded-xl p-4 text-sm ${
              isUnrealistic ? 'bg-red-50 text-red-700' :
              insight.type === 'easy' ? 'bg-green-50 text-green-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {isUnrealistic && <p className="font-semibold mb-1">⚠ Physiologically challenging</p>}
              {insight.msg}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            localStorage.setItem('onboarding_goal_secs', goalSecs.toString())
            router.push('/onboarding/plan-preview')
          }}
          disabled={goalSecs <= 0}
          className="mt-6 w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
        >
          Generate my 22-week plan →
        </button>
      </div>
    </main>
  )
}
