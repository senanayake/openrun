import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RunLogForm } from '@/components/RunLogForm'

const onSuccess = vi.fn()

beforeEach(() => {
  onSuccess.mockClear()
})

test('renders required fields', () => {
  render(<RunLogForm onSuccess={onSuccess} />)
  expect(screen.getByLabelText(/distance/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /log run/i })).toBeInTheDocument()
})

test('shows validation error when distance missing', async () => {
  render(<RunLogForm onSuccess={onSuccess} />)
  fireEvent.click(screen.getByRole('button', { name: /log run/i }))
  await waitFor(() => {
    expect(screen.getByText(/distance and duration are required/i)).toBeInTheDocument()
  })
})

test('calls onSuccess after successful submit', async () => {
  const user = userEvent.setup()
  render(<RunLogForm onSuccess={onSuccess} />)

  await user.type(screen.getByLabelText(/distance/i), '12')
  // set duration minutes
  const minutesInputs = screen.getAllByRole('spinbutton')
  await user.type(minutesInputs[2], '74') // Hours, Minutes, Seconds order

  fireEvent.click(screen.getByRole('button', { name: /log run/i }))

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledWith('run-stub-1')
  })
})
