import { test, expect } from '@playwright/test'
import { seedOnboarding } from './fixtures/seed'

test.describe('UJ2 — Daily workout', () => {
  test.beforeEach(async ({ page }) => {
    await seedOnboarding(page)
  })

  test('dashboard shows today\'s workout card', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/today/i)).toBeVisible()
  })

  test('clicking workout card navigates to detail', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link').first().click()
    await expect(page).toHaveURL(/\/workout\//)
  })

  test('workout detail shows structured steps', async ({ page }) => {
    await page.goto('/dashboard')
    // find a workout link and follow it
    const workoutLink = page.getByRole('link', { name: /run/i }).first()
    await workoutLink.click()
    await expect(page.getByText(/workout structure/i)).toBeVisible()
  })

  test('zone explainer toggles on click', async ({ page }) => {
    await page.goto('/dashboard')
    const workoutLink = page.getByRole('link', { name: /run/i }).first()
    await workoutLink.click()
    await page.waitForSelector('text=Workout structure')

    const zoneBtn = page.getByRole('button', { name: /what does zone/i }).first()
    await zoneBtn.click()
    await expect(page.getByText(/aerobic base zone|very light effort|moderate effort|hard effort|maximum effort/i)).toBeVisible()
  })
})
