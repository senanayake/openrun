'use client'

import { CoachChat } from '@/components/CoachChat'

export default function CoachPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
        <p className="text-sm text-gray-500 mt-1">Ask anything about your training, race strategy, or recovery.</p>
      </div>
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-4 min-h-0">
        <CoachChat />
      </div>
    </main>
  )
}
