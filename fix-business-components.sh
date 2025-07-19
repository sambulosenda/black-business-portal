#!/bin/bash

# Fix business-hero.tsx
cat > /tmp/business-hero-fix.txt << 'EOF'
import type { BusinessWithRelations, BusinessPhoto } from '@/types'

interface BusinessHeroProps {
  business: BusinessWithRelations
  photos: BusinessPhoto[]
}
EOF

# Fix floating-actions.tsx
cat > /tmp/floating-actions-fix.txt << 'EOF'
import type { BusinessWithRelations } from '@/types'

interface FloatingActionsProps {
  business: BusinessWithRelations
}
EOF

# Fix gallery-section.tsx
cat > /tmp/gallery-section-fix.txt << 'EOF'
import type { BusinessPhoto } from '@/types'

interface GallerySectionProps {
  photos: BusinessPhoto[]
}
EOF

# Fix products-section.tsx
cat > /tmp/products-section-fix.txt << 'EOF'
import type { BusinessWithRelations, ProductWithRelations, ProductCategory } from '@/types'

interface ProductsSectionProps {
  business: BusinessWithRelations
  products: ProductWithRelations[]
  categories: ProductCategory[]
}
EOF

# Fix reviews-section.tsx
cat > /tmp/reviews-section-fix.txt << 'EOF'
import type { ReviewWithRelations } from '@/types'

interface ReviewsSectionProps {
  reviews: ReviewWithRelations[]
}
EOF

# Fix sticky-header.tsx
cat > /tmp/sticky-header-fix.txt << 'EOF'
import type { BusinessWithRelations } from '@/types'

interface StickyHeaderProps {
  business: BusinessWithRelations
}
EOF

echo "Type definitions prepared for all business components"