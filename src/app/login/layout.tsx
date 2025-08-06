import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your Glamfric account to book appointments, manage your bookings, and discover beauty services near you.',
  openGraph: {
    title: 'Sign In | Glamfric',
    description:
      'Sign in to your Glamfric account to book appointments and manage your beauty services.',
    url: '/login',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sign In | Glamfric',
    description:
      'Sign in to your Glamfric account to book appointments and manage your beauty services.',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
