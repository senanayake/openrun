import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { CoachChat } from '@/components/CoachChat'

test('renders starter prompts when no messages', () => {
  render(<CoachChat />)
  expect(screen.getByText(/why is my long run pace important/i)).toBeInTheDocument()
})

test('renders input and send button', () => {
  render(<CoachChat />)
  expect(screen.getByPlaceholderText(/ask your coach/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
})

test('send button disabled when input empty', () => {
  render(<CoachChat />)
  expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
})

test('shows rate limit message on 429', async () => {
  server.use(
    http.post('/api/coach', () => new HttpResponse(null, { status: 429 }))
  )
  const user = userEvent.setup()
  render(<CoachChat />)

  await user.type(screen.getByPlaceholderText(/ask your coach/i), 'Hello')
  fireEvent.click(screen.getByRole('button', { name: /send/i }))

  await waitFor(() => {
    expect(screen.getByText(/daily message limit/i)).toBeInTheDocument()
  })
})
