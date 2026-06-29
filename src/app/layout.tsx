import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alpha Signal — AI Investment Research Agent',
  description: 'AI-powered investment research and decision engine',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
