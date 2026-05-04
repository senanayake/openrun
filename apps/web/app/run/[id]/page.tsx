'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RunAnalysis } from '@/components/RunAnalysis'

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

export default function RunPage() {
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<RunDetail | null>(null)

  useEffect(() => {
    fetch(`/api/runs/${id}`).then(r => r.json()).then(setRun)
  }, [id])

  if (!run) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Run logged — {run.distance_km} km
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(run.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <RunAnalysis run={run} />
      </div>
    </main>
  )
}
