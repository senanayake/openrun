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

  test('next button disabled before calculating VDOT', async ({ page }) => {
    await page.goto('/onboarding/fitness')
    const btn = page.getByRole('button', { name: /choose my race/i })
    await expect(btn).toBeDisabled()
  })
})
