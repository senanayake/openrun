import { render, screen } from '@testing-library/react'
import { WorkoutCard } from '@/components/WorkoutCard'

const STUB = {
  id: 'w-1',
  type: 'tempo',
  distance_km: 10,
  target_pace_sec_per_km: 310,
  target_hr_zone: 4,
  estimated_duration_min: 52,
  description: 'Threshold tempo run at race effort.',
  phase: 'support',
  week_number: 8,
}

test('renders workout type and distance', () => {
  render(<WorkoutCard workout={STUB} />)
  expect(screen.getByText(/tempo run/i)).toBeInTheDocument()
  expect(screen.getByText('10 km')).toBeInTheDocument()
})

test('renders pace in MM:SS format', () => {
  render(<WorkoutCard workout={STUB} />)
  expect(screen.getByText(/5:10/)).toBeInTheDocument()
})

test('renders phase badge', () => {
  render(<WorkoutCard workout={STUB} />)
  expect(screen.getByText('support')).toBeInTheDocument()
})

test('renders description', () => {
  render(<WorkoutCard workout={STUB} />)
  expect(screen.getByText(/Threshold tempo run/)).toBeInTheDocument()
})

test('links to workout detail page', () => {
  render(<WorkoutCard workout={STUB} />)
  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', '/workout/w-1')
})
