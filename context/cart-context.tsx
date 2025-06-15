"use client"

import type { Product } from "@/types/supabase"
import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context" // Corrected: useAuth directly
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import type { SupabaseClient } from "@supabase/supabase-js"

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
  isLoading: boolean // Cart-specific loading
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  isCartSupabaseConnected: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const LOCAL_STORAGE_CART_KEY = "wheatgrassFreshCart"

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartLoading, setIsCartLoading] = useState(true) // Cart's own loading state
  const { user, isLoading: isAuthLoading, isSupabaseInitialized: isAuthSupabaseInitialized } = useAuth() // Get auth loading state
  const { toast } = useToast()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartSupabase, setCartSupabase] = useState<SupabaseClient | null>(null)
  const [isCartSupabaseConnected, setIsCartSupabaseConnected] = useState(false)

  useEffect(() => {
    // Initialize Supabase client for cart, if Auth says it's generally initialized
    if (isAuthSupabaseInitialized) {
      const client = getSupabase()
      setCartSupabase(client)
      setIsCartSupabaseConnected(!!client)
      if (!client) {
        console.warn(
          "[CartContext] Supabase client not available for cart operations despite Auth init. Cart will be offline.",
        )
      }
    } else {
      // If Auth context hasn't initialized Supabase, cart can't use it either.
      setIsCartSupabaseConnected(false)
    }
  }, [isAuthSupabaseInitialized])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])

  const getCartFromLocalStorage = useCallback((): CartItem[] => {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(LOCAL_STORAGE_CART_KEY)
      try {
        return localData ? JSON.parse(localData) : []
      } catch (e) {
        console.error("[CartContext] Error parsing cart from local storage:", e)
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY)
        return []
      }
    }
    return []
  }, [])

  const saveCartToLocalStorage = useCallback((items: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items))
    }
  }, [])

  const fetchUserCart = useCallback(
    async (userId: string) => {
      if (!cartSupabase || !isCartSupabaseConnected) {
        console.warn("[CartContext] fetchUserCart: Supabase client not available. Using local cart.")
        setCartItems(getCartFromLocalStorage())
        setIsCartLoading(false)
        return
      }
      setIsCartLoading(true)
      console.log(`[CartContext] fetchUserCart: Fetching for user ${userId}`)
      try {
        const { data, error, status } = await cartSupabase
          .from("cart_items")
          .select("quantity, products (*)")
          .eq("user_id", userId)

        if (error) throw error // Let catch block handle specific error logging

        if (data) {
          const fetchedCartItems: CartItem[] = data
            .map((item) => (item.products ? { ...(item.products as Product), quantity: item.quantity } : null))
            .filter((item): item is CartItem => item !== null)
          setCartItems(fetchedCartItems)
          console.log("[CartContext] fetchUserCart: Successfully fetched and set cart items.")
        }
      } catch (error: any) {
        console.error("[CartContext] Error during fetchUserCart:", error.message, error)
        const isNetworkError = error.message?.toLowerCase().includes("failed to fetch")
        toast({
          title: "Cart Loading Error",
          description: isNetworkError
            ? "Network issue: Could not load your cart from the server. Using local data if available."
            : `Could not load cart. (Details: ${error.message || "Unknown error"})`,
          variant: "destructive",
        })
        setCartItems(getCartFromLocalStorage())
      } finally {
        setIsCartLoading(false)
      }
    },
    [cartSupabase, isCartSupabaseConnected, toast, getCartFromLocalStorage],
  )

  const mergeLocalCartWithDb = useCallback(
    async (userId: string, localCartItems: CartItem[]) => {
      if (!cartSupabase || !isCartSupabaseConnected || localCartItems.length === 0) {
        if (localCartItems.length > 0) {
          // If there's local cart but no DB, keep local
          setCartItems(localCartItems)
        } else if (userId && cartSupabase && isCartSupabaseConnected) {
          // No local cart, try fetching DB
          await fetchUserCart(userId) // This will set loading states
          return // fetchUserCart handles its own loading
        }
        setIsCartLoading(false) // No merge, no fetch, stop loading
        return
      }

      console.log("[CartContext] mergeLocalCartWithDb: Attempting merge...")
      setIsCartLoading(true)
      try {
        const { data: dbCartData, error: fetchError } = await cartSupabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("user_id", userId)

        if (fetchError) throw fetchError

        const dbCartMap = new Map(dbCartData.map((item) => [item.product_id, item.quantity]))
        const itemsToUpsert = localCartItems.map((localItem) => ({
          user_id: userId,
          product_id: Number(localItem.id),
          quantity: (dbCartMap.get(localItem.id) || 0) + localItem.quantity,
        }))

        if (itemsToUpsert.length > 0) {
          const { error: upsertError } = await cartSupabase
            .from("cart_items")
            .upsert(itemsToUpsert, { onConflict: "user_id,product_id" })
          if (upsertError) throw upsertError
        }

        if (typeof window !== "undefined") localStorage.removeItem(LOCAL_STORAGE_CART_KEY)
        console.log("[CartContext] mergeLocalCartWithDb: Merge successful. Refetching cart.")
        await fetchUserCart(userId) // Refetch the final merged cart
      } catch (error: any) {
        console.error("[CartContext] Error merging cart:", error.message, error)
        toast({
          title: "Cart Sync Error",
          description: "Could not sync local cart with server. Local items remain available.",
          variant: "destructive",
        })
        setCartItems(localCartItems) // Fallback to local cart on merge error
        setIsCartLoading(false)
      }
    },
    [cartSupabase, isCartSupabaseConnected, fetchUserCart, toast],
  )

  // Effect for loading initial cart data (depends on Auth state)
  useEffect(() => {
    console.log(
      `[CartContext] Main effect: AuthLoading: ${isAuthLoading}, User: ${user?.id}, CartSupabaseConnected: ${isCartSupabaseConnected}`,
    )
    if (isAuthLoading) {
      console.log("[CartContext] Main effect: Auth is loading, cart operations paused.")
      setIsCartLoading(true) // If auth is loading, cart should also be in a loading state
      return
    }

    // Auth has finished loading
    if (user && isCartSupabaseConnected) {
      console.log(`[CartContext] Main effect: User ${user.id} logged in and Supabase connected for cart.`)
      const localCart = getCartFromLocalStorage()
      if (localCart.length > 0) {
        console.log("[CartContext] Main effect: Local cart found, attempting merge.")
        mergeLocalCartWithDb(user.id, localCart)
      } else {
        console.log("[CartContext] Main effect: No local cart, fetching user cart from DB.")
        fetchUserCart(user.id)
      }
    } else if (!user) {
      console.log("[CartContext] Main effect: No user logged in. Loading cart from local storage.")
      setCartItems(getCartFromLocalStorage())
      setIsCartLoading(false)
    } else if (user && !isCartSupabaseConnected) {
      console.warn(
        "[CartContext] Main effect: User logged in, but Supabase NOT connected for cart. Loading from local storage.",
      )
      setCartItems(getCartFromLocalStorage())
      setIsCartLoading(false)
    }
  }, [user, isAuthLoading, isCartSupabaseConnected, getCartFromLocalStorage, mergeLocalCartWithDb, fetchUserCart])

  // Effect for saving to local storage (if not logged in or Supabase not connected for cart)
  useEffect(() => {
    if (!isCartLoading && (!user || !isCartSupabaseConnected)) {
      saveCartToLocalStorage(cartItems)
    }
  }, [cartItems, user, isCartSupabaseConnected, isCartLoading, saveCartToLocalStorage])

  const addToCart = async (product: Product, quantity = 1) => {
    let newQuantityInCart = quantity
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      let newItems
      if (existingItem) {
        newQuantityInCart = existingItem.quantity + quantity
        newItems = prevItems.map((item) => (item.id === product.id ? { ...item, quantity: newQuantityInCart } : item))
      } else {
        newItems = [...prevItems, { ...product, quantity }]
      }
      // Local save handled by separate useEffect
      return newItems
    })
    toast({ title: "Added to Cart", description: `${product.name} has been added.` })

    if (user && cartSupabase && isCartSupabaseConnected) {
      try {
        const { error } = await cartSupabase
          .from("cart_items")
          .upsert(
            { user_id: user.id, product_id: Number(product.id), quantity: newQuantityInCart },
            { onConflict: "user_id,product_id" },
          )
        if (error) throw error
      } catch (error: any) {
        console.error("[CartContext] Error saving item to DB cart:", error.message, error)
        toast({ title: "Sync Error", description: "Could not save item to cloud.", variant: "destructive" })
      }
    }
  }

  // removeFromCart, updateQuantity, clearCart remain similar but should use cartSupabase
  // and check isCartSupabaseConnected before DB operations.

  const removeFromCart = async (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    toast({ title: "Removed from Cart" })
    if (user && cartSupabase && isCartSupabaseConnected) {
      try {
        const { error } = await cartSupabase
          .from("cart_items")
          .delete()
          .match({ user_id: user.id, product_id: Number(productId) })
        if (error) throw error
      } catch (error: any) {
        console.error("[CartContext] Error deleting item from DB cart:", error.message, error)
        toast({ title: "Sync Error", description: "Could not remove from cloud.", variant: "destructive" })
      }
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    if (user && cartSupabase && isCartSupabaseConnected) {
      try {
        const { error } = await cartSupabase
          .from("cart_items")
          .update({ quantity })
          .match({ user_id: user.id, product_id: Number(productId) })
        if (error) throw error
      } catch (error: any) {
        console.error("[CartContext] Error updating quantity in DB cart:", error.message, error)
        toast({ title: "Sync Error", description: "Could not update in cloud.", variant: "destructive" })
      }
    }
  }

  const clearCart = async () => {
    setCartItems([])
    toast({ title: "Cart Cleared" })
    if (user && cartSupabase && isCartSupabaseConnected) {
      try {
        const { error } = await cartSupabase.from("cart_items").delete().match({ user_id: user.id })
        if (error) throw error
      } catch (error: any) {
        console.error("[CartContext] Error clearing DB cart:", error.message, error)
        toast({ title: "Sync Error", description: "Could not clear cloud cart.", variant: "destructive" })
      }
    }
  }

  const getItemCount = () => cartItems.reduce((count, item) => count + item.quantity, 0)
  const getSubtotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isLoading: isCartLoading, // Use cart's own loading state
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isCartSupabaseConnected,
      }}
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
