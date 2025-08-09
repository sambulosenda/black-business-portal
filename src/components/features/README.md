# Feature Components

Domain-specific components organized by feature area.

## Structure

```
features/
├── business/       # Business-related components
│   └── photo-manager.tsx
└── search/         # Search and discovery components
    ├── business-map.tsx
    └── business-map-fallback.tsx
```

## Purpose

Feature components are:
- **Domain-specific** - Tied to specific business logic
- **Self-contained** - Include their own styles and logic
- **Reusable within domain** - Used across multiple pages in the same feature

## Guidelines

### When to add here
- Component is specific to a feature (business, search, booking)
- Used in 2+ pages within the same domain
- Contains business logic, not just UI

### When NOT to add here
- Generic UI components → `/components/ui`
- Layout components → `/components/layouts`
- Cross-domain utilities → `/components/shared`

## Component Categories

### Business Components (`/business`)
- Photo management
- Service cards
- Staff management
- Analytics charts
- Business profile forms

### Search Components (`/search`)
- Search filters
- Result cards
- Map integration
- Location services
- Sort/filter controls

### Future Folders
```
features/
├── booking/        # Booking flow components
├── payment/        # Payment processing
├── reviews/        # Review system
└── notifications/  # Alert components
```

## Best Practices

1. **Co-locate styles** - Keep CSS modules with components
2. **Type safety** - Define TypeScript interfaces
3. **Error boundaries** - Wrap complex features
4. **Lazy loading** - Use dynamic imports for heavy components
5. **Testing** - Unit tests for business logic

## Example Structure

```typescript
// features/booking/BookingCalendar.tsx
interface BookingCalendarProps {
  businessId: string
  onDateSelect: (date: Date) => void
}

export default function BookingCalendar({...}: BookingCalendarProps) {
  // Feature-specific logic here
}
```