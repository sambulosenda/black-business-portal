import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://glamfric.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/business/dashboard/',
          '/api/',
          '/checkout/',
          '/cart/',
          '/bookings/',
          '/payment/',
          '/order/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
