'use client'

import { formatPace, formatTime } from '@/lib/mapbox'

interface RunDetail {
  id: string
  date: string
  planned_workout_id: string | null
  distance_km: number
  duration_seconds: number
  avg_hr: number | null
  perceived_effort: number
  notes: string
  tss: number
  planned_distance_km?: number
  planned_pace_sec_per_km?: number
  ai_feedback?: string
}

interface RunAnalysisProps {
  run: RunDetail
}

const EFFORT_LABELS = ['', 'Very easy', 'Easy', 'Moderate', 'Hard', 'Very hard', 'Maximum']

function percentDiff(actual: number, planned: number) {
  return ((actual - planned) / planned) * 100
}

function complianceBadge(pct: number) {
  const abs = Math.abs(pct)
  if (abs <= 5) return { label: 'On target', colour: 'bg-emerald-100 text-emerald-700' }
  if (abs <= 15) return { label: pct > 0 ? 'Slightly over' : 'Slightly under', colour: 'bg-amber-100 text-amber-700' }
  return { label: pct > 0 ? 'Over target' : 'Under target', colour: 'bg-red-100 text-red-700' }
}

export function RunAnalysis({ run }: RunAnalysisProps) {
  const actualPace = run.duration_seconds / run.distance_km

  const distanceDiff = run.planned_distance_km
    ? percentDiff(run.distance_km, run.planned_distance_km)
    : null
  const paceDiff = run.planned_pace_sec_per_km
    ? percentDiff(actualPace, run.planned_pace_sec_per_km)
    : null

  const distanceBadge = distanceDiff !== null ? complianceBadge(distanceDiff) : null
  const paceBadge = paceDiff !== null ? complianceBadge(-paceDiff) : null // lower pace = faster = good

  return (
    <div className="space-y-5">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Distance', value: `${run.distance_km} km` },
          { label: 'Duration', value: formatTime(run.duration_seconds) },
          { label: 'Avg pace', value: `${formatPace(actualPace)} /km` },
          { label: 'TSS', value: run.tss.toFixed(0) },
          ...(run.avg_hr ? [{ label: 'Avg HR', value: `${run.avg_hr} bpm` }] : []),
          { label: 'Effort', value: EFFORT_LABELS[run.perceived_effort] },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="font-semibold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance vs plan */}
      {(distanceBadge || paceBadge) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">vs. planned</h2>
          <div className="space-y-3">
            {distanceBadge && run.planned_distance_km && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-xs text-gray-400">
                    {run.distance_km} km vs {run.planned_distance_km} km planned
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${distanceBadge.colour}`}>
                  {distanceBadge.label} ({distanceDiff! > 0 ? '+' : ''}{distanceDiff!.toFixed(1)}%)
                </span>
              </div>
            )}
            {paceBadge && run.planned_pace_sec_per_km && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pace</p>
                  <p className="text-xs text-gray-400">
                    {formatPace(actualPace)} /km vs {formatPace(run.planned_pace_sec_per_km)} /km planned
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${paceBadge.colour}`}>
                  {paceBadge.label}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {run.notes && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
          <p className="text-sm text-gray-700">{run.notes}</p>
        </div>
      )}

      {/* AI feedback */}
      {run.ai_feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Coach feedback</p>
          <p className="text-sm text-gray-700">{run.ai_feedback}</p>
        </div>
      )}
    </div>
  )
}
