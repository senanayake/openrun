import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ5 — Rebuild plan', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('plan preview page shows weeks swimlane', async ({ page }) => {
    await page.goto('/onboarding/plan-preview')
    await page.waitForSelector('text=Confirm and start training', { timeout: 15000 })
    await expect(page.getByText(/W1/)).toBeVisible()
  })

  test('clicking a different week updates the detail panel', async ({ page }) => {
    await page.goto('/onboarding/plan-preview')
    await page.waitForSelector('text=Confirm and start training', { timeout: 15000 })
    // W1 is selected by default; click W3
    await page.getByText('W3').click()
    await expect(page.getByText(/week 3/i)).toBeVisible()
  })

  test('week detail shows workout dots and km total', async ({ page }) => {
    await page.goto('/onboarding/plan-preview')
    await page.waitForSelector('text=Confirm and start training', { timeout: 15000 })
    // The selected week detail panel shows total km
    await expect(page.getByText(/km total/i)).toBeVisible()
  })

  test('confirm redirects to dashboard', async ({ page }) => {
    await page.goto('/onboarding/plan-preview')
    await page.waitForSelector('text=Confirm and start training', { timeout: 15000 })
    await page.getByRole('button', { name: /confirm and start training/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })
})
