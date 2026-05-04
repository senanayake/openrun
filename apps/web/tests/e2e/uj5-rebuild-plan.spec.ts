import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ5 — Rebuild plan', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('plan preview page shows weeks swimlane', async ({ page }) => {
    await page.goto('/onboarding/plan-preview')
    await page.waitForSelector('text=Confirm and start training')
    await expect(page.getByText(/W1/)).toBeVisible()
  })

  test('confirm redirects to dashboard', async ({ page }) => {
    await page.goto('/onboarding/plan-preview')
    await page.waitForSelector('text=Confirm and start training')
    await page.getByRole('button', { name: /confirm and start training/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })
})
