import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ3 — Log a run', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('log page renders the form', async ({ page }) => {
    await page.goto('/log')
    await expect(page.getByText('Log a run')).toBeVisible()
    await expect(page.getByRole('button', { name: /log run/i })).toBeVisible()
  })

  test('submitting valid form redirects to /run/:id and shows run details', async ({ page }) => {
    await page.goto('/log')

    await page.getByLabel(/distance/i).fill('12')
    const spinbuttons = page.getByRole('spinbutton')
    await spinbuttons.nth(1).fill('74') // minutes

    await page.getByRole('button', { name: /log run/i }).click()
    await expect(page).toHaveURL(/\/run\//)
    // Verify the run detail page rendered with the logged distance
    await page.waitForSelector('text=/Run logged/', { timeout: 10000 })
    await expect(page.getByText(/run logged.*12 km/i)).toBeVisible()
  })

  test('shows error if distance missing', async ({ page }) => {
    await page.goto('/log')
    await page.getByRole('button', { name: /log run/i }).click()
    await expect(page.getByText(/distance and duration are required/i)).toBeVisible()
  })
})
