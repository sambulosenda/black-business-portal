'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

interface CartProduct {
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  name: string
  price: number
  quantity: number
  image?: string
  type: 'product'
}

interface CartService {
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  name: string
  price: number
  duration: number
  date?: Date
  time?: string
  staffId?: string
  type: 'service'
}

type CartItem = CartProduct | CartService

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addProduct: (product: Omit<CartProduct, 'type'>) => void
  addService: (service: Omit<CartService, 'type'>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  clearBusinessItems: (businessId: string) => void
  getBusinessItems: (businessId: string) => CartItem[]
  hasItemsFromBusiness: (businessId: string) => boolean
  hasItemsFromOtherBusinesses: (businessId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'beauty-portal-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error('Failed to load cart from storage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const itemCount = items.reduce((count, item) => {
    if (item.type === 'product') {
      return count + item.quantity
    }
    return count + 1 // Services count as 1 each
  }, 0)

  const subtotal = items.reduce((total, item) => {
    if (item.type === 'product') {
      return total + (item.price * item.quantity)
    }
    return total + item.price
  }, 0)

  const hasItemsFromBusiness = (businessId: string) => {
    return items.some(item => item.businessId === businessId)
  }

  const hasItemsFromOtherBusinesses = (businessId: string) => {
    return items.some(item => item.businessId !== businessId)
  }

  const getBusinessItems = (businessId: string) => {
    return items.filter(item => item.businessId === businessId)
  }

  const addProduct = (product: Omit<CartProduct, 'type'>) => {
    // Check if we have items from other businesses
    if (items.length > 0 && hasItemsFromOtherBusinesses(product.businessId)) {
      const otherBusiness = items.find(item => item.businessId !== product.businessId)
      if (!confirm(`You have items from ${otherBusiness?.businessName} in your cart. Adding items from ${product.businessName} will remove the other items. Continue?`)) {
        return
      }
      // Clear items from other businesses
      setItems(items.filter(item => item.businessId === product.businessId))
    }

    setItems(prevItems => {
      // Check if product already exists in cart
      const existingItem = prevItems.find(
        item => item.type === 'product' && item.id === product.id
      ) as CartProduct | undefined

      if (existingItem) {
        // Update quantity
        return prevItems.map(item =>
          item.id === product.id && item.type === 'product'
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      }

      // Add new product
      return [...prevItems, { ...product, type: 'product' as const }]
    })

    toast.success(`${product.name} added to cart`)
  }

  const addService = (service: Omit<CartService, 'type'>) => {
    // Check if we have items from other businesses
    if (items.length > 0 && hasItemsFromOtherBusinesses(service.businessId)) {
      const otherBusiness = items.find(item => item.businessId !== service.businessId)
      if (!confirm(`You have items from ${otherBusiness?.businessName} in your cart. Adding items from ${service.businessName} will remove the other items. Continue?`)) {
        return
      }
      // Clear items from other businesses
      setItems(items.filter(item => item.businessId === service.businessId))
    }

    // Services are unique - can't have duplicates
    const serviceWithType: CartService = { ...service, type: 'service' }
    setItems(prevItems => [...prevItems, serviceWithType])
    toast.success(`${service.name} added to cart`)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.type === 'product'
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
    toast.success('Item removed from cart')
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  const clearBusinessItems = (businessId: string) => {
    setItems(prevItems => prevItems.filter(item => item.businessId !== businessId))
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addProduct,
        addService,
        updateQuantity,
        removeItem,
        clearCart,
        clearBusinessItems,
        getBusinessItems,
        hasItemsFromBusiness,
        hasItemsFromOtherBusinesses,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}