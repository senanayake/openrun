import { render, screen } from '@testing-library/react'
import { PaceZoneBar } from '@/components/PaceZoneBar'
import type { PaceZone } from '@/lib/types'

const ZONES: PaceZone[] = [
  { zone: 1, name: 'Recovery', min_pace_sec_per_km: 390, max_pace_sec_per_km: 430, color: '#3b82f6' },
  { zone: 2, name: 'Aerobic', min_pace_sec_per_km: 360, max_pace_sec_per_km: 390, color: '#10b981' },
  { zone: 3, name: 'Tempo', min_pace_sec_per_km: 330, max_pace_sec_per_km: 360, color: '#f59e0b' },
  { zone: 4, name: 'Threshold', min_pace_sec_per_km: 305, max_pace_sec_per_km: 330, color: '#f97316' },
  { zone: 5, name: 'VO2max', min_pace_sec_per_km: 270, max_pace_sec_per_km: 305, color: '#ef4444' },
]

test('renders all 5 zone segments', () => {
  render(<PaceZoneBar zones={ZONES} />)
  expect(screen.getAllByText(/Z\d/).length).toBeGreaterThanOrEqual(5)
})

test('renders without currentPace (no active zone)', () => {
  render(<PaceZoneBar zones={ZONES} />)
  const bar = screen.getByTestId('pace-zone-bar')
  expect(bar).toBeInTheDocument()
})

test('renders pace range labels', () => {
  render(<PaceZoneBar zones={ZONES} />)
  expect(screen.getByText(/fast/i)).toBeInTheDocument()
  expect(screen.getByText(/slow/i)).toBeInTheDocument()
})

test('returns null for empty zones', () => {
  const { container } = render(<PaceZoneBar zones={[]} />)
  expect(container.firstChild).toBeNull()
})
