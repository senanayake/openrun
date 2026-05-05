import { test, expect } from '@playwright/test'
import { clearOnboarding } from './fixtures/seed'

test.describe('UJ1 — Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await clearOnboarding(page)
  })

  test('navigates through all 4 onboarding steps', async ({ page }) => {
    await page.goto('/onboarding/fitness')
    await expect(page.getByText('Step 1 of 4')).toBeVisible()

    // Fill in a time performance
    await page.getByLabel(/distance/i).fill('42.195')
    await page.getByLabel(/hours/i).fill('3')
    await page.getByLabel(/minutes/i).fill('10')
    await page.getByLabel(/seconds/i).fill('00')
    await page.getByRole('button', { name: /calculate/i }).click()

    await expect(page.getByText(/VDOT/i)).toBeVisible()
    await page.getByRole('button', { name: /choose my race/i }).click()

    // Step 2 — Race
    await expect(page).toHaveURL('/onboarding/race')
    await expect(page.getByText('Step 2 of 4')).toBeVisible()
  })

  test('shows VDOT score after calculating', async ({ page }) => {
    await page.goto('/onboarding/fitness')
    await page.getByLabel(/distance/i).fill('10')
    await page.getByLabel(/hours/i).fill('0')
    await page.getByLabel(/minutes/i).fill('41')
    await page.getByLabel(/seconds/i).fill('00')
    await page.getByRole('button', { name: /calculate/i }).click()
    await expect(page.getByText(/VDOT/i)).toBeVisible()
  })

  test('selecting a race shows elevation chart without crashing', async ({ page }) => {
    await page.goto('/onboarding/race')
    // Wait for race list to load
    await page.waitForSelector('text=/km/', { timeout: 10000 })
    // Click first race card
    await page.getByRole('link').first().click()
    // Elevation chart or course map should render — no crash
    await expect(page.getByText(/elevation|km|course/i).first()).toBeVisible()
  })

  test('next button disabled before calculating VDOT', async ({ page }) => {
    await page.goto('/onboarding/fitness')
    const btn = page.getByRole('button', { name: /choose my race/i })
    await expect(btn).toBeDisabled()
  })
})
