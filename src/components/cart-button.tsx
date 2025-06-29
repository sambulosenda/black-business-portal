'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'

export function CartButton() {
  const { itemCount } = useCart()

  return (
    <Link href="/cart">
      <Button variant="outline" size="sm" className="relative">
        <ShoppingCart className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  )
}