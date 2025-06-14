"use client"

import type { Product } from "@/types/supabase"
import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context" // To get user status
import { getSupabase } from "@/lib/supabase" // For client-side Supabase
import { useToast } from "@/components/ui/use-toast"

export interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const LOCAL_STORAGE_CART_KEY = "wheatgrassFreshCart"

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, sessionLoading } = useAuth()
  const supabase = getSupabase()
  const { toast } = useToast()

  const fetchUserCart = useCallback(
    async (userId: string) => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select(
            `
          quantity,
          products (*)
        `,
          )
          .eq("user_id", userId)

        if (error) throw error

        if (data) {
          const fetchedCartItems: CartItem[] = data
            .map((item) => {
              if (item.products) {
                // Ensure products is not null
                return {
                  ...(item.products as Product), // Cast products to Product
                  quantity: item.quantity,
                }
              }
              return null // Or handle missing product data appropriately
            })
            .filter((item): item is CartItem => item !== null) // Filter out nulls
          setCartItems(fetchedCartItems)
        }
      } catch (error: any) {
        console.error("Error fetching cart from DB:", error)
        toast({ title: "Error", description: "Could not load your cart from the cloud.", variant: "destructive" })
        // Fallback to local storage if DB fetch fails for logged-in user
        const localCart = getCartFromLocalStorage()
        setCartItems(localCart)
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, toast],
  )

  const getCartFromLocalStorage = (): CartItem[] => {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(LOCAL_STORAGE_CART_KEY)
      return localData ? JSON.parse(localData) : []
    }
    return []
  }

  const saveCartToLocalStorage = (items: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items))
    }
  }

  // Effect to load cart on mount and when user changes
  useEffect(() => {
    if (!sessionLoading) {
      // Only run after session loading is complete
      if (user) {
        fetchUserCart(user.id)
      } else {
        const localCart = getCartFromLocalStorage()
        setCartItems(localCart)
        setIsLoading(false)
      }
    }
  }, [user, sessionLoading, fetchUserCart])

  // Effect to save to local storage whenever cartItems change (for anonymous users or as backup)
  useEffect(() => {
    if (!user) {
      // Only save to LS if user is not logged in
      saveCartToLocalStorage(cartItems)
    }
  }, [cartItems, user])

  const addToCart = async (product: Product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      let newItems
      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        newItems = [...prevItems, { ...product, quantity }]
      }
      if (!user) saveCartToLocalStorage(newItems) // Save to LS for anon users
      return newItems
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })

    if (user) {
      try {
        // Upsert logic for database
        const { error } = await supabase.from("cart_items").upsert(
          {
            user_id: user.id,
            product_id: product.id,
            quantity: cartItems.find((item) => item.id === product.id)
              ? cartItems.find((item) => item.id === product.id)!.quantity + quantity
              : quantity,
          },
          { onConflict: "user_id,product_id" },
        )
        if (error) throw error
      } catch (error: any) {
        console.error("Error saving item to DB cart:", error)
        toast({ title: "Sync Error", description: "Could not save item to cloud cart.", variant: "destructive" })
        // Optionally revert local change or mark item as unsynced
      }
    }
  }

  const removeFromCart = async (productId: number) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== productId)
      if (!user) saveCartToLocalStorage(newItems)
      return newItems
    })
    toast({
      title: "Removed from Cart",
      description: `Item has been removed from your cart.`,
    })
    if (user) {
      try {
        const { error } = await supabase.from("cart_items").delete().match({ user_id: user.id, product_id: productId })
        if (error) throw error
      } catch (error: any) {
        console.error("Error deleting item from DB cart:", error)
        toast({ title: "Sync Error", description: "Could not remove item from cloud cart.", variant: "destructive" })
      }
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
      if (!user) saveCartToLocalStorage(newItems)
      return newItems
    })

    if (user) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .match({ user_id: user.id, product_id: productId })
        if (error) throw error
      } catch (error: any) {
        console.error("Error updating quantity in DB cart:", error)
        toast({
          title: "Sync Error",
          description: "Could not update item quantity in cloud cart.",
          variant: "destructive",
        })
      }
    }
  }

  const clearCart = async () => {
    setCartItems([])
    if (!user) saveCartToLocalStorage([])
    toast({
      title: "Cart Cleared",
      description: "Your cart has been emptied.",
    })
    if (user) {
      try {
        const { error } = await supabase.from("cart_items").delete().match({ user_id: user.id })
        if (error) throw error
      } catch (error: any) {
        console.error("Error clearing DB cart:", error)
        toast({ title: "Sync Error", description: "Could not clear cloud cart.", variant: "destructive" })
      }
    }
  }

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Function to merge local cart with DB cart on login
  const mergeLocalCartWithDb = useCallback(
    async (userId: string, localCartItems: CartItem[]) => {
      if (localCartItems.length === 0) return
      setIsLoading(true)
      try {
        const { data: dbCartData, error: fetchError } = await supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("user_id", userId)

        if (fetchError) throw fetchError

        const dbCartMap = new Map(dbCartData.map((item) => [item.product_id, item.quantity]))
        const itemsToUpsert = []

        for (const localItem of localCartItems) {
          const dbQuantity = dbCartMap.get(localItem.id)
          const newQuantity = dbQuantity ? dbQuantity + localItem.quantity : localItem.quantity
          itemsToUpsert.push({
            user_id: userId,
            product_id: localItem.id,
            quantity: newQuantity,
          })
        }

        if (itemsToUpsert.length > 0) {
          const { error: upsertError } = await supabase.from("cart_items").upsert(itemsToUpsert, {
            onConflict: "user_id,product_id",
          })
          if (upsertError) throw upsertError
        }
        // After successful merge, clear local storage and refetch cart
        if (typeof window !== "undefined") localStorage.removeItem(LOCAL_STORAGE_CART_KEY)
        fetchUserCart(userId) // This will set isLoading to false
      } catch (error) {
        console.error("Error merging cart:", error)
        toast({
          title: "Cart Merge Error",
          description: "Could not merge local cart with cloud.",
          variant: "destructive",
        })
        setIsLoading(false) // Ensure loading is false on error
      }
    },
    [supabase, fetchUserCart, toast],
  )

  useEffect(() => {
    if (!sessionLoading && user) {
      const localCart = getCartFromLocalStorage()
      if (localCart.length > 0) {
        mergeLocalCartWithDb(user.id, localCart)
      } else {
        fetchUserCart(user.id)
      }
    } else if (!sessionLoading && !user) {
      const localCart = getCartFromLocalStorage()
      setCartItems(localCart)
      setIsLoading(false)
    }
  }, [user, sessionLoading, fetchUserCart, mergeLocalCartWithDb])

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getItemCount, getSubtotal, isLoading }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
