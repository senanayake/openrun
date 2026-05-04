import Link from 'next/link'

interface OnboardingWizardProps {
  currentStep: 1 | 2 | 3 | 4
}

const STEPS = [
  { n: 1, label: 'Fitness', href: '/onboarding/fitness' },
  { n: 2, label: 'Race', href: '/onboarding/race' },
  { n: 3, label: 'Goal', href: '/onboarding/goal' },
  { n: 4, label: 'Plan', href: '/onboarding/plan-preview' },
]

export function OnboardingWizard({ currentStep }: OnboardingWizardProps) {
  return (
    <nav className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = step.n < currentStep
        const active = step.n === currentStep
        return (
          <div key={step.n} className="flex items-center">
            {i > 0 && (
              <div className={`h-px w-8 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
            <div className="flex flex-col items-center">
              {done ? (
                <Link href={step.href}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                    ✓
                  </div>
                </Link>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.n}
                </div>
              )}
              <p className={`text-xs mt-1 ${active ? 'text-blue-600 font-medium' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
