import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpenRun — Evidence-based running coaching',
  description: 'Train smarter with science-backed coaching, personalised to you.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
