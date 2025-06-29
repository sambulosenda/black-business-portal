'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/contexts/cart-context'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </SessionProvider>
  )
}