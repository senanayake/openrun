'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Settings {
  name: string
  age: number | ''
  gender: 'male' | 'female' | 'other' | ''
  max_hr: number | ''
  resting_hr: number | ''
  weekly_mileage_target: number | ''
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    name: '', age: '', gender: '', max_hr: '', resting_hr: '', weekly_mileage_target: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('athlete_settings')
    if (stored) setSettings(JSON.parse(stored))
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('athlete_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    if (!confirm('This will clear your plan and onboarding data. Continue?')) return
    localStorage.clear()
    router.push('/onboarding/fitness')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Update your athlete profile.</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                min="16"
                max="90"
                value={settings.age}
                onChange={e => setSettings(s => ({ ...s, age: e.target.value ? parseInt(e.target.value) : '' }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={settings.gender}
                onChange={e => setSettings(s => ({ ...s, gender: e.target.value as Settings['gender'] }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max HR (bpm)</label>
              <input
                type="number"
                min="140"
                max="220"
                value={settings.max_hr}
                onChange={e => setSettings(s => ({ ...s, max_hr: e.target.value ? parseInt(e.target.value) : '' }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resting HR (bpm)</label>
              <input
                type="number"
                min="30"
                max="100"
                value={settings.resting_hr}
                onChange={e => setSettings(s => ({ ...s, resting_hr: e.target.value ? parseInt(e.target.value) : '' }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weekly mileage target (km)</label>
            <input
              type="number"
              min="10"
              max="200"
              value={settings.weekly_mileage_target}
              onChange={e => setSettings(s => ({ ...s, weekly_mileage_target: e.target.value ? parseInt(e.target.value) : '' }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors"
          >
            {saved ? 'Saved ✓' : 'Save settings'}
          </button>
        </form>

        <div className="mt-6 bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="font-semibold text-red-700 mb-2">Reset</h2>
          <p className="text-sm text-gray-600 mb-4">Clear all training data and restart onboarding.</p>
          <button
            onClick={handleReset}
            className="bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Reset and start over
          </button>
        </div>
      </div>
    </main>
  )
}
