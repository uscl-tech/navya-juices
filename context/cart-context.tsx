"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "./auth-context"

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
  isSyncing: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { user } = useAuth()
  const supabase = getSupabase()

  // Calculate total items in cart
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  // Calculate subtotal
  const subtotal = items
    .reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace("$", ""))
      return total + price * item.quantity
    }, 0)
    .toFixed(2)

  // Load cart from localStorage or Supabase on mount
  useEffect(() => {
    const loadCart = async () => {
      setMounted(true)

      if (user) {
        // If user is logged in, load cart from Supabase
        setIsSyncing(true)
        try {
          const { data, error } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", user.id)

          if (error) {
            console.error("Error loading cart from Supabase:", error)
          } else if (data && data.length > 0) {
            // Convert Supabase data to CartItem format
            const cartItems: CartItem[] = data.map((item) => ({
              id: item.product_id,
              name: item.products.name,
              price: `$${item.products.price.toFixed(2)}`,
              image: item.products.image_url,
              quantity: item.quantity,
            }))
            setItems(cartItems)
          } else {
            // If no items in Supabase but items in localStorage, sync localStorage to Supabase
            const storedCart = localStorage.getItem("cart")
            if (storedCart) {
              try {
                const localItems = JSON.parse(storedCart)
                setItems(localItems)

                // Sync to Supabase
                for (const item of localItems) {
                  await supabase.from("cart_items").upsert({
                    user_id: user.id,
                    product_id: item.id,
                    quantity: item.quantity,
                  })
                }
              } catch (error) {
                console.error("Failed to parse cart from localStorage:", error)
              }
            }
          }
        } catch (error) {
          console.error("Error in loadCart:", error)
        } finally {
          setIsSyncing(false)
        }
      } else {
        // If no user, load from localStorage
        const storedCart = localStorage.getItem("cart")
        if (storedCart) {
          try {
            setItems(JSON.parse(storedCart))
          } catch (error) {
            console.error("Failed to parse cart from localStorage:", error)
          }
        }
      }
    }

    loadCart()
  }, [user])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, mounted])

  // Sync cart to Supabase when it changes and user is logged in
  useEffect(() => {
    const syncCartToSupabase = async () => {
      if (!user || !mounted || isSyncing) return

      setIsSyncing(true)

      try {
        // First, delete all existing items
        await supabase.from("cart_items").delete().eq("user_id", user.id)

        // Then insert all current items
        if (items.length > 0) {
          const cartData = items.map((item) => ({
            user_id: user.id,
            product_id: item.id,
            quantity: item.quantity,
          }))

          await supabase.from("cart_items").insert(cartData)
        }
      } catch (error) {
        console.error("Error syncing cart to Supabase:", error)
      } finally {
        setIsSyncing(false)
      }
    }

    syncCartToSupabase()
  }, [items, user, mounted, isSyncing])

  // Add item to cart
  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id)

      if (existingItem) {
        return prevItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }

      return [...prevItems, { ...newItem, quantity: 1 }]
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
        isSyncing,
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
