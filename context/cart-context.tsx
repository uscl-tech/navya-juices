"use client"

import type { Product } from "@/types/supabase"
import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context"
import { getSupabase } from "@/lib/supabase"
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
      console.log("[CartContext] Attempting to fetch user cart...")

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("[CartContext] CRITICAL: Supabase URL or Anon Key is missing for diagnostic ping.")
        toast({ title: "Config Error", description: "Supabase URL/Key missing.", variant: "destructive" })
        setIsLoading(false)
        return
      }

      try {
        console.log("[CartContext] Now attempting Supabase client call to fetch cart_items...")
        if (!supabase) {
          console.error("[CartContext] Supabase client is not available for fetching cart items.")
          throw new Error("Supabase client not initialized.")
        }
        const { data, error, status } = await supabase
          .from("cart_items")
          .select("quantity, products (*)")
          .eq("user_id", userId)

        if (error) {
          console.error(
            `[CartContext] Supabase client returned an error. Status: ${status}, Message: ${error.message}`,
            error,
          )
          throw error
        }

        console.log("[CartContext] Supabase client call successful. Data received:", data ? "Yes" : "No")
        if (data) {
          const fetchedCartItems: CartItem[] = data
            .map((item) => (item.products ? { ...(item.products as Product), quantity: item.quantity } : null))
            .filter((item): item is CartItem => item !== null)
          setCartItems(fetchedCartItems)
        }
      } catch (error: any) {
        console.error("[CartContext] Error fetching cart from DB using Supabase client. Details:", error)
        if (error.name && error.message) {
          console.error("[CartContext] Error Name:", error.name) // e.g., TypeError
          console.error("[CartContext] Error Message:", error.message) // e.g., Failed to fetch
        }
        const configuredSupabaseUrl = supabaseUrl || "URL_NOT_FOUND_IN_ENV"
        console.error(
          "[CartContext] Supabase URL configured:",
          configuredSupabaseUrl.substring(0, Math.min(configuredSupabaseUrl.length, 40)) + "...",
        )
        toast({
          title: "Network Error",
          description: `Could not load cart. (Details: ${error.message || "Failed to fetch"})`,
          variant: "destructive",
        })
        const localCart = getCartFromLocalStorage()
        setCartItems(localCart)
      } finally {
        setIsLoading(false)
        console.log("[CartContext] fetchUserCart finished.")
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

  useEffect(() => {
    if (!sessionLoading) {
      if (user) {
        fetchUserCart(user.id)
      } else {
        const localCart = getCartFromLocalStorage()
        setCartItems(localCart)
        setIsLoading(false)
      }
    }
  }, [user, sessionLoading, fetchUserCart])

  useEffect(() => {
    if (!user) {
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
      if (!user) saveCartToLocalStorage(newItems)
      return newItems
    })
    toast({ title: "Added to Cart", description: `${product.name} has been added.` })
    if (user && supabase) {
      try {
        const currentItem = cartItems.find((item) => item.id === product.id)
        const newQuantity = currentItem ? currentItem.quantity + quantity : quantity
        const { error } = await supabase
          .from("cart_items")
          .upsert(
            { user_id: user.id, product_id: Number(product.id), quantity: newQuantity },
            { onConflict: "user_id,product_id" },
          )
        if (error) throw error
      } catch (error: any) {
        console.error("Error saving item to DB cart:", error)
        toast({ title: "Sync Error", description: "Could not save item to cloud.", variant: "destructive" })
      }
    }
  }

  const removeFromCart = async (productId: number) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== productId)
      if (!user) saveCartToLocalStorage(newItems)
      return newItems
    })
    toast({ title: "Removed from Cart" })
    if (user && supabase) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .match({ user_id: user.id, product_id: Number(productId) })
        if (error) throw error
      } catch (error: any) {
        console.error("Error deleting item from DB cart:", error)
        toast({ title: "Sync Error", description: "Could not remove from cloud.", variant: "destructive" })
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
    if (user && supabase) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .match({ user_id: user.id, product_id: Number(productId) })
        if (error) throw error
      } catch (error: any) {
        console.error("Error updating quantity in DB cart:", error)
        toast({ title: "Sync Error", description: "Could not update in cloud.", variant: "destructive" })
      }
    }
  }

  const clearCart = async () => {
    setCartItems([])
    if (!user) saveCartToLocalStorage([])
    toast({ title: "Cart Cleared" })
    if (user && supabase) {
      try {
        const { error } = await supabase.from("cart_items").delete().match({ user_id: user.id })
        if (error) throw error
      } catch (error: any) {
        console.error("Error clearing DB cart:", error)
        toast({ title: "Sync Error", description: "Could not clear cloud cart.", variant: "destructive" })
      }
    }
  }

  const getItemCount = () => cartItems.reduce((count, item) => count + item.quantity, 0)
  const getSubtotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const mergeLocalCartWithDb = useCallback(
    async (userId: string, localCartItems: CartItem[]) => {
      if (localCartItems.length === 0 || !supabase) return
      setIsLoading(true)
      console.log("[CartContext] Merging local cart with DB...")
      try {
        const { data: dbCartData, error: fetchError } = await supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("user_id", userId)
        if (fetchError) throw fetchError

        const dbCartMap = new Map(dbCartData.map((item) => [item.product_id, item.quantity]))
        const itemsToUpsert = localCartItems.map((localItem) => {
          const dbQuantity = dbCartMap.get(localItem.id) || 0
          return { user_id: userId, product_id: Number(localItem.id), quantity: dbQuantity + localItem.quantity }
        })

        if (itemsToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from("cart_items")
            .upsert(itemsToUpsert, { onConflict: "user_id,product_id" })
          if (upsertError) throw upsertError
        }
        if (typeof window !== "undefined") localStorage.removeItem(LOCAL_STORAGE_CART_KEY)
        console.log("[CartContext] Merge successful. Refetching cart.")
        fetchUserCart(userId)
      } catch (error) {
        console.error("[CartContext] Error merging cart:", error)
        toast({ title: "Cart Merge Error", description: "Could not sync local cart.", variant: "destructive" })
        setIsLoading(false)
      }
    },
    [supabase, fetchUserCart, toast],
  )

  useEffect(() => {
    if (!sessionLoading && supabase) {
      if (user) {
        const localCart = getCartFromLocalStorage()
        if (localCart.length > 0) {
          mergeLocalCartWithDb(user.id, localCart)
        } else {
          fetchUserCart(user.id)
        }
      } else {
        const localCart = getCartFromLocalStorage()
        setCartItems(localCart)
        setIsLoading(false)
      }
    } else if (!sessionLoading && !supabase) {
      console.warn("[CartContext] Supabase client not ready during initial load effect.")
      setIsLoading(false)
    }
  }, [user, sessionLoading, supabase, fetchUserCart, mergeLocalCartWithDb])

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
