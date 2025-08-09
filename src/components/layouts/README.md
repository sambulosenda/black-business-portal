# Layout Components

Core layout components used across the application.

## Structure

```
layouts/
├── navigation.tsx  # Main navigation bar
└── footer.tsx     # Site footer
```

## Purpose

Layout components provide:
- **Consistent structure** - Same header/footer across pages
- **Navigation** - Site-wide navigation elements
- **Responsive design** - Mobile/desktop layouts

## Current Components

### Navigation (`navigation.tsx`)
- Main navigation bar
- User authentication state
- Mobile hamburger menu
- Role-based menu items
- Search bar integration

### Footer (`footer.tsx`)
- Company information
- Quick links
- Social media links
- Legal pages
- Newsletter signup

## Usage

Layout components are typically used in:
- Root layout (`app/layout.tsx`)
- Route group layouts
- Page-specific layouts

```typescript
// Example in app/layout.tsx
import Navigation from '@/components/layouts/navigation'
import Footer from '@/components/layouts/footer'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## Guidelines

### Do's
- Keep layouts lightweight
- Lazy load heavy components
- Use semantic HTML
- Ensure accessibility (ARIA labels)
- Responsive by default

### Don'ts
- Business logic in layouts
- Heavy computations
- Direct API calls (use server components)
- Inline styles

## Future Components

Consider adding:
- `Sidebar.tsx` - Dashboard sidebar navigation
- `MobileNav.tsx` - Mobile-specific navigation
- `Breadcrumbs.tsx` - Page hierarchy navigation
- `Header.tsx` - Page headers with actions

## Performance

- Use `next/dynamic` for client-only components
- Implement sticky navigation with CSS (not JS)
- Optimize images in footer
- Cache navigation data