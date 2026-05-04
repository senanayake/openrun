import { render, screen } from '@testing-library/react'
import { TrainingLoadChart } from '@/components/TrainingLoadChart'

vi.mock('react-chartjs-2', () => ({
  Chart: ({ data }: { data: { datasets: { label: string }[] } }) => (
    <div data-testid="chart">
      {data.datasets.map((ds: { label: string }) => (
        <span key={ds.label}>{ds.label}</span>
      ))}
    </div>
  ),
}))

const DAILY = [
  { date: '2026-04-28', tss: 65, ctl: 42.1, atl: 44.8, tsb: -2.7 },
  { date: '2026-04-29', tss: 0,  ctl: 41.1, atl: 38.4, tsb: 2.7 },
  { date: '2026-04-30', tss: 90, ctl: 43.2, atl: 50.6, tsb: -7.4 },
]

test('renders chart with CTL, ATL, TSB datasets', () => {
  render(<TrainingLoadChart data={DAILY} />)
  expect(screen.getByText(/CTL/)).toBeInTheDocument()
  expect(screen.getByText(/ATL/)).toBeInTheDocument()
  expect(screen.getByText(/TSB/)).toBeInTheDocument()
})

test('renders chart element', () => {
  render(<TrainingLoadChart data={DAILY} />)
  expect(screen.getByTestId('chart')).toBeInTheDocument()
})
