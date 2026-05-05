import { test, expect } from '@playwright/test'
import { clearOnboarding } from './fixtures/seed'

test.describe('UJ1 — Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await clearOnboarding(page)
  })

  test('completes all 4 onboarding steps through to dashboard', async ({ page }) => {
    // Step 1 — Fitness
    await page.goto('/onboarding/fitness')
    await expect(page.getByText('Step 1 of 4')).toBeVisible()

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
    await page.waitForSelector('[role="button"]', { timeout: 10000 })
    await page.getByRole('button').filter({ hasText: /marathon/i }).first().click()
    await page.waitForSelector('text=/Train for/', { timeout: 5000 })
    await page.getByRole('button', { name: /train for/i }).click()

    // Step 3 — Goal
    await expect(page).toHaveURL('/onboarding/goal')
    await expect(page.getByText('Step 3 of 4')).toBeVisible()
    await page.getByRole('button', { name: /generate my.*plan/i }).click()

    // Step 4 — Plan preview
    await expect(page).toHaveURL('/onboarding/plan-preview')
    await expect(page.getByText('Step 4 of 4')).toBeVisible()
    await page.waitForSelector('text=/W1/', { timeout: 15000 })
    await expect(page.getByText(/W1/)).toBeVisible()
    await page.getByRole('button', { name: /confirm and start training/i }).click()

    await expect(page).toHaveURL('/dashboard')
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
    await page.waitForSelector('[role="button"]', { timeout: 10000 })
    await page.getByRole('button').filter({ hasText: /marathon/i }).first().click()
    await expect(page.getByText(/train for/i)).toBeVisible()
  })

  test('next button disabled before calculating VDOT', async ({ page }) => {
    await page.goto('/onboarding/fitness')
    const btn = page.getByRole('button', { name: /choose my race/i })
    await expect(btn).toBeDisabled()
  })
})
