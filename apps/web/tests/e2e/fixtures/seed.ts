import type { Page } from '@playwright/test'

export async function seedOnboarding(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_vdot', '48.5')
    localStorage.setItem('onboarding_marathon_secs', '11400')
    localStorage.setItem('onboarding_race_id', 'twin-cities-marathon-2026')
    localStorage.setItem('onboarding_race_name', 'Twin Cities Marathon 2026')
    localStorage.setItem('onboarding_race_date', '2026-10-04')
    localStorage.setItem('onboarding_goal_secs', '12600')
    localStorage.setItem('onboarding_complete', '1')
  })
}

export async function clearOnboarding(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear()
  })
}
