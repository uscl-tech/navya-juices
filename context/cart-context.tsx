"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type CartItem = {
  id: number
  name: string
  price: string
  image: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  totalItems: number
  subtotal: string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Calculate total items in cart
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  // Calculate subtotal
  const subtotal = items
    .reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace("$", ""))
      return total + price * item.quantity
    }, 0)
    .toFixed(2)

  // Add item to cart
  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id)

      // Ensure price is in the correct format
      const formattedPrice = newItem.price.startsWith("$") ? newItem.price : `$${newItem.price}`

      if (existingItem) {
        return prevItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }

      return [...prevItems, { ...newItem, price: formattedPrice, quantity: 1 }]
    })

    // Open cart drawer when adding items
    setIsOpen(true)
  }

  // Remove item from cart
  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      setMounted(true)
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart)
          // Validate the cart data structure
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart)
          } else {
            // If invalid format, initialize empty cart
            setItems([])
            localStorage.setItem("cart", JSON.stringify([]))
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error)
          // Reset cart if there's an error
          setItems([])
          localStorage.setItem("cart", JSON.stringify([]))
        }
      }
    }

    loadCart()
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, mounted])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
