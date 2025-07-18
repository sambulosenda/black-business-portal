import Script from 'next/script'

interface LocalBusinessProps {
  name: string
  description?: string
  address?: string
  city?: string
  postalCode?: string
  telephone?: string
  email?: string
  priceRange?: string
  ratingValue?: number
  ratingCount?: number
  image?: string
  url: string
  services?: string[]
}

export function LocalBusinessSchema({
  name,
  description,
  address,
  city,
  postalCode,
  telephone,
  email,
  priceRange,
  ratingValue,
  ratingCount,
  image,
  url,
  services = [],
}: LocalBusinessProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name,
    description,
    url,
    telephone,
    email,
    address: address ? {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city,
      postalCode: postalCode,
      addressCountry: 'US',
    } : undefined,
    priceRange,
    aggregateRating: ratingValue && ratingCount ? {
      '@type': 'AggregateRating',
      ratingValue,
      ratingCount,
    } : undefined,
    image,
    hasOfferCatalog: services.length > 0 ? {
      '@type': 'OfferCatalog',
      name: 'Beauty Services',
      itemListElement: services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        name: service,
      })),
    } : undefined,
  }

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema))

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanSchema),
      }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Glamfric',
    description: 'Find and instantly book appointments at top-rated African beauty salons near you.',
    url: process.env.NEXT_PUBLIC_URL || 'https://glamfric.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_URL || 'https://glamfric.com'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}