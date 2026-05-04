import { redirect } from 'next/navigation'

// Redirect root to onboarding (no session) or dashboard (has session).
// For now, always go to onboarding until auth is wired.
export default function Home() {
  redirect('/onboarding/fitness')
}
