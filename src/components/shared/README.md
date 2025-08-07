# Shared Components

Cross-cutting components and utilities used throughout the application.

## Structure

```
shared/
├── providers.tsx    # Context providers and wrappers
├── loading-page.tsx # Full-page loading state
└── seo/            # SEO and meta components
    └── structured-data.tsx
```

## Purpose

Shared components are:
- **Cross-domain** - Used across multiple feature areas
- **Infrastructure** - Provide app-wide functionality
- **Utilities** - Helper components and wrappers

## Current Components

### Providers (`providers.tsx`)
- NextAuth session provider
- Theme provider
- Toast notifications (Sonner)
- Analytics providers
- Error boundaries

### Loading States (`loading-page.tsx`)
- Full-page loading spinner
- Skeleton screens
- Progress indicators
- Suspense fallbacks

### SEO (`seo/structured-data.tsx`)
- JSON-LD structured data
- Open Graph tags
- Meta tag management
- Schema.org markup

## Usage Patterns

### Providers
```typescript
// Used in root layout
import { Providers } from '@/components/shared/providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Loading States
```typescript
import LoadingPage from '@/components/shared/loading-page'

export default function Loading() {
  return <LoadingPage />
}
```

### SEO Components
```typescript
import { StructuredData } from '@/components/shared/seo/structured-data'

export default function BusinessPage({ business }) {
  return (
    <>
      <StructuredData type="LocalBusiness" data={business} />
      {/* Page content */}
    </>
  )
}
```

## Guidelines

### When to add here
- Used in 3+ different feature areas
- Provides infrastructure/utility
- Not tied to specific business logic
- App-wide configuration

### When NOT to add here
- Feature-specific → `/components/features`
- Pure UI → `/components/ui`
- Layout elements → `/components/layouts`

## Best Practices

1. **Minimal dependencies** - Keep shared components lightweight
2. **Clear interfaces** - Well-documented props
3. **No business logic** - Pure utilities only
4. **Performance** - Optimize for repeated use
5. **Tree-shaking** - Export individual components

## Future Additions

Consider adding:
- `ErrorBoundary.tsx` - Global error handling
- `Analytics.tsx` - Event tracking wrapper
- `MetaTags.tsx` - Dynamic meta management
- `LazyImage.tsx` - Optimized image loading
- `Portal.tsx` - Portal for modals/tooltips