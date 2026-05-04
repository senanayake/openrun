'use client'

import { useRouter } from 'next/navigation'
import { RunLogForm } from '@/components/RunLogForm'

export default function LogPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Log a run</h1>
        <p className="text-sm text-gray-500 mt-1">Record what actually happened — we'll update your training load.</p>
      </div>
      <div className="max-w-lg mx-auto px-4 py-8">
        <RunLogForm onSuccess={runId => router.push(`/run/${runId}`)} />
      </div>
    </main>
  )
}
