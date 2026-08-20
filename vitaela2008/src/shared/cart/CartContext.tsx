import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import CartAddedNotification from '@/components/common/CartAddedNotification'

export interface CartProduct {
  id: string
  name: string
  image: string
  unitPrice: number
}

export interface CartItem extends CartProduct {
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (product: CartProduct, quantity: number) => void
  announceAdded: (productName: string) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'vitaella_cart'

function readStoredCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart)
  const [addedProductName, setAddedProductName] = useState<string | null>(null)
  const notificationTimeout = useRef<number | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: CartProduct, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === product.id)
      if (existing) {
        return prev.map((entry) => (entry.id === product.id ? { ...entry, quantity: entry.quantity + quantity } : entry))
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => prev.map((entry) => (entry.id === id ? { ...entry, quantity: Math.max(1, quantity) } : entry)))
  }

  const clearCart = () => setItems([])

  const announceAdded = (productName: string) => {
    setAddedProductName(productName)
    if (notificationTimeout.current) window.clearTimeout(notificationTimeout.current)
    notificationTimeout.current = window.setTimeout(() => setAddedProductName(null), 2800)
  }

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items])

  return (
      <CartContext.Provider value={{ items, addItem, announceAdded, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
      {addedProductName && <CartAddedNotification productName={addedProductName} />}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider')
  return context
}
