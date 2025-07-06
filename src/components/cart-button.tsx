'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus, Package } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CartButton() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Group items by business for better organization
  const itemsByBusiness = items.reduce((acc, item) => {
    if (!acc[item.businessId]) {
      acc[item.businessId] = {
        businessName: item.businessName,
        items: []
      }
    }
    acc[item.businessId].items.push(item)
    return acc
  }, {} as Record<string, { businessName: string; items: typeof items }>)

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "relative hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all",
          isOpen && "bg-gradient-to-r from-indigo-50 to-purple-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="ml-2 hidden sm:inline">Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs text-white flex items-center justify-center font-medium shadow-sm">
            {itemCount}
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link href="/search" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Browse Services
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(itemsByBusiness).map(([businessId, { businessName, items: businessItems }]) => (
                  <div key={businessId} className="p-4 border-b border-gray-100 last:border-0">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{businessName}</h4>
                    <div className="space-y-3">
                      {businessItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
                            <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors ml-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full hover:bg-gray-100">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}