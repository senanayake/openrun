import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ2 — Daily workout', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('dashboard shows today\'s workout card', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/today/i)).toBeVisible()
    await expect(page.getByText(/easy run/i)).toBeVisible()
  })

  test('clicking workout card navigates to detail with content', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: /easy run/i }).first().click()
    await expect(page).toHaveURL(/\/workout\//)
    // Wait for API response and verify content renders
    await page.waitForSelector('text=Workout structure', { timeout: 10000 })
    await expect(page.getByText(/easy run — 12 km/i)).toBeVisible()
    await expect(page.getByText(/Warm-up/i)).toBeVisible()
  })

  test('workout detail shows structured steps', async ({ page }) => {
    await page.goto('/dashboard')
    const workoutLink = page.getByRole('link', { name: /easy run/i }).first()
    await workoutLink.click()
    await page.waitForSelector('text=Workout structure', { timeout: 10000 })
    await expect(page.getByText(/workout structure/i)).toBeVisible()
    await expect(page.getByText(/Main set/i)).toBeVisible()
    await expect(page.getByText(/Cool-down/i)).toBeVisible()
  })

  test('zone explainer toggles on click', async ({ page }) => {
    await page.goto('/dashboard')
    const workoutLink = page.getByRole('link', { name: /easy run/i }).first()
    await workoutLink.click()
    await page.waitForSelector('text=Workout structure', { timeout: 10000 })

    const zoneBtn = page.getByRole('button', { name: /what does zone/i }).first()
    await zoneBtn.click()
    await expect(page.getByText(/aerobic base zone|very light effort|moderate effort|hard effort|maximum effort/i)).toBeVisible()
  })
})
