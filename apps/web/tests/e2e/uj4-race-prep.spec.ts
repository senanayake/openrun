import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ4 — Race preparation', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('races page shows race cards', async ({ page }) => {
    await page.goto('/races')
    await expect(page.getByText(/Twin Cities Marathon/i)).toBeVisible()
  })

  test('search filters race list', async ({ page }) => {
    await page.goto('/races')
    await page.getByPlaceholder(/search races/i).fill('zzzznotarealrace')
    await expect(page.getByText(/no races match/i)).toBeVisible()
  })

  test('clicking race card navigates to detail with elevation profile', async ({ page }) => {
    await page.goto('/races')
    await page.getByRole('link', { name: /twin cities/i }).first().click()
    await expect(page).toHaveURL(/\/races\/twin-cities/)
    // Wait for race data to load
    await page.waitForSelector('text=Elevation profile', { timeout: 10000 })
    await expect(page.getByText(/Elevation profile/i)).toBeVisible()
    await expect(page.getByText(/Twin Cities Marathon/i)).toBeVisible()
    // Verify course stats section rendered
    await expect(page.getByText(/Distance/i)).toBeVisible()
  })

  test('race detail shows BQ badge for qualifying race', async ({ page }) => {
    await page.goto('/races/twin-cities-marathon-2026')
    await page.waitForSelector('text=BQ Qualifier', { timeout: 10000 })
    await expect(page.getByText('BQ Qualifier')).toBeVisible()
  })

  test('pace bands shown when goal time set', async ({ page }) => {
    await page.goto('/races/twin-cities-marathon-2026')
    // onboarding seed sets onboarding_goal_secs → pace bands should load
    await page.waitForSelector('text=Pace bands', { timeout: 10000 })
    await expect(page.getByText(/Pace bands/i)).toBeVisible()
  })
})
