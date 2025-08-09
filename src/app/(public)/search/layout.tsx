import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Beauty Services Near You',
  description:
    'Search and book appointments at top-rated beauty salons, hair stylists, nail technicians, and spa professionals in your area. Compare prices and read reviews.',
  keywords: [
    'find beauty salon',
    'beauty services near me',
    'book hair appointment',
    'nail salon near me',
    'spa near me',
    'beauty professionals',
  ],
  openGraph: {
    title: 'Find Beauty Services Near You | Glamfric',
    description:
      'Search and book appointments at top-rated beauty salons in your area. Compare prices and read reviews.',
    url: '/search',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Beauty Services Near You | Glamfric',
    description: 'Search and book appointments at top-rated beauty salons in your area.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
