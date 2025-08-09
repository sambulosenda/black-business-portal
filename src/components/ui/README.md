# UI Components

Reusable, presentational components following a consistent design system.

## Overview

This directory contains pure UI components that:
- Have no business logic
- Are highly reusable
- Follow consistent design patterns
- Are fully accessible (WCAG 2.1 AA)

## Component Library

### Form Components
- `input.tsx` - Text inputs with validation states
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown selection
- `checkbox.tsx` - Checkbox with label
- `radio-group.tsx` - Radio button groups
- `switch.tsx` - Toggle switches
- `form-field.tsx` - Form field wrapper with label/error
- `form-feedback.tsx` - Success/error messages

### Data Display
- `table.tsx` - Data tables with sorting
- `data-table.tsx` - Advanced table with filters
- `card.tsx` - Content cards
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatars
- `chart.tsx` - Chart components

### Feedback
- `alert.tsx` - Alert messages
- `toast.tsx` (via `sonner.tsx`) - Toast notifications
- `progress.tsx` - Progress bars
- `spinner.tsx` - Loading spinners
- `skeleton.tsx` - Skeleton loaders
- `empty-state.tsx` - Empty state messages

### Overlay
- `dialog.tsx` - Modal dialogs
- `sheet.tsx` - Slide-out panels
- `popover.tsx` - Popover menus
- `dropdown-menu.tsx` - Dropdown menus
- `command.tsx` - Command palette
- `tooltip.tsx` - Hover tooltips

### Navigation
- `tabs.tsx` - Tab navigation
- `breadcrumb.tsx` - Breadcrumb trails
- `sidebar.tsx` - Sidebar navigation
- `progress-steps.tsx` - Multi-step progress

### Layout
- `separator.tsx` - Visual separators
- `scroll-area.tsx` - Scrollable areas

### Specialized
- `calendar.tsx` - Date picker calendar
- `time-slot-selector.tsx` - Time slot selection
- `price-range-slider.tsx` - Price range selector
- `image-upload.tsx` - Image upload with preview
- `s3-image.tsx` - S3 image component
- `success-animation.tsx` - Success animations

## Usage Example

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Form</CardTitle>
      </CardHeader>
      <Input placeholder="Enter text..." />
      <Button variant="primary" size="lg">
        Submit
      </Button>
    </Card>
  )
}
```

## Design Tokens

Components use CSS variables for theming:
- `--primary` - Primary brand color
- `--secondary` - Secondary color
- `--destructive` - Error/danger color
- `--muted` - Muted backgrounds
- `--radius` - Border radius

## Accessibility

All components include:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

## Best Practices

### Do's
- Use TypeScript for all components
- Include JSDoc comments
- Export both component and types
- Support all valid HTML attributes
- Use forwardRef for DOM access

### Don'ts
- Add business logic
- Make API calls
- Use component-specific styles
- Hard-code colors/sizes
- Break accessibility

## Testing

Each component should have:
- Unit tests for logic
- Accessibility tests
- Visual regression tests
- Storybook stories

## Contributing

When adding new UI components:
1. Check if similar component exists
2. Follow existing patterns
3. Add TypeScript types
4. Include examples in comments
5. Update this README