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

  test('starter prompt populates and sends a message', async ({ page }) => {
    await page.goto('/coach')
    await page.getByText(/why is my long run pace important/i).click()
    // Message should appear in chat
    await expect(page.getByText(/why is my long run pace important/i)).toBeVisible()
  })

  test('typing in input enables send button', async ({ page }) => {
    await page.goto('/coach')
    await page.getByPlaceholder(/ask your coach/i).fill('Hello')
    await expect(page.getByRole('button', { name: /send/i })).toBeEnabled()
  })
})
