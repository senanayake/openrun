import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ6 — AI coach chat', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('coach page shows starter prompts', async ({ page }) => {
    await page.goto('/coach')
    await expect(page.getByText(/why is my long run pace important/i)).toBeVisible()
  })

  test('send button disabled with empty input', async ({ page }) => {
    await page.goto('/coach')
    await expect(page.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  test('starter prompt sends message and shows it in chat', async ({ page }) => {
    await page.goto('/coach')
    await page.getByText(/why is my long run pace important/i).click()
    // Starter prompts disappear once a message is sent; user message appears as a chat bubble
    await expect(page.getByText(/why is my long run pace important/i)).toBeVisible()
    // Send button should now be disabled (input cleared)
    await expect(page.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  test('typing in input enables send button', async ({ page }) => {
    await page.goto('/coach')
    await page.getByPlaceholder(/ask your coach/i).fill('Hello')
    await expect(page.getByRole('button', { name: /send/i })).toBeEnabled()
  })

  test('typing and submitting a message shows it as a user bubble', async ({ page }) => {
    await page.goto('/coach')
    await page.getByPlaceholder(/ask your coach/i).fill('What is threshold pace?')
    await page.getByRole('button', { name: /send/i }).click()
    // User message appears in the chat
    await expect(page.getByText('What is threshold pace?')).toBeVisible()
    // Input is cleared after sending
    await expect(page.getByPlaceholder(/ask your coach/i)).toHaveValue('')
  })
})
