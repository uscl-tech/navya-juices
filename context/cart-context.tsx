"use client"

import type { Product } from "@/types/supabase"
import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context"
import { getSupabase } from "@/lib/supabase" // Corrected path
import { useToast } from "@/components/ui/use-toast"
import type { SupabaseClient } from "@supabase/supabase-js" // Import type

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
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  isSupabaseConnected: boolean // To indicate if Supabase client is available
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const LOCAL_STORAGE_CART_KEY = "wheatgrassFreshCart"

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, sessionLoading } = useAuth()
  const { toast } = useToast()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [supabase, setSupabase] = useState<SupabaseClient<any, "public", any> | null>(null)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [initializationAttempted, setInitializationAttempted] = useState(false)

  useEffect(() => {
    if (!initializationAttempted) {
      const client = getSupabase()
      setSupabase(client)
      setIsSupabaseConnected(!!client)
      setInitializationAttempted(true) // Mark that we've tried to initialize

      if (!client) {
        console.warn("[CartContext] Supabase client failed to initialize. Cart will operate in offline mode.")
        // No toast here, getSupabase logs critical errors.
        // A general "offline" banner could be shown elsewhere if needed.
      }
    }
  }, [initializationAttempted])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])

  const getCartFromLocalStorage = (): CartItem[] => {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(LOCAL_STORAGE_CART_KEY)
      try {
        return localData ? JSON.parse(localData) : []
      } catch (e) {
        console.error("Error parsing cart from local storage:", e)
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY) // Clear corrupted data
        return []
      }
    }
    return []
  }

  const saveCartToLocalStorage = (items: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items))
    }
  }

  const fetchUserCart = useCallback(
    async (userId: string) => {
      if (!supabase) {
        console.warn("[CartContext] fetchUserCart: Supabase client not available. Using local cart.")
        setCartItems(getCartFromLocalStorage())
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const { data, error, status } = await supabase
          .from("cart_items")
          .select("quantity, products (*)")
          .eq("user_id", userId)

        if (error) {
          console.error(
            `[CartContext] Supabase error fetching cart. Status: ${status}, Message: ${error.message}`,
            error,
          )
          throw error
        }
        if (data) {
          const fetchedCartItems: CartItem[] = data
            .map((item) => (item.products ? { ...(item.products as Product), quantity: item.quantity } : null))
            .filter((item): item is CartItem => item !== null)
          setCartItems(fetchedCartItems)
        }
      } catch (error: any) {
        console.error("[CartContext] Error during fetchUserCart:", error)
        const isNetworkError = error.message?.toLowerCase().includes("failed to fetch")
        toast({
          title: "Cart Error",
          description: isNetworkError
            ? "Failed to connect to server to load your cart. Using local data if available."
            : `Could not load cart. (Details: ${error.message || "Unknown error"})`,
          variant: "destructive",
        })
        setCartItems(getCartFromLocalStorage()) // Fallback
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, toast],
  )

  const mergeLocalCartWithDb = useCallback(
    async (userId: string, localCartItems: CartItem[]) => {
      if (!supabase || localCartItems.length === 0) {
        if (!supabase) console.warn("[CartContext] mergeLocalCart: Supabase client not available. Merge aborted.")
        if (localCartItems.length > 0)
          fetchUserCart(userId) // Try to fetch DB cart if local was empty
        else setIsLoading(false)
        return
      }

      console.log("[CartContext] Attempting to merge local cart with DB...")
      setIsLoading(true)
      try {
        const { data: dbCartData, error: fetchError } = await supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("user_id", userId)

        if (fetchError) throw fetchError

        const dbCartMap = new Map(dbCartData.map((item) => [item.product_id, item.quantity]))
        const itemsToUpsert = localCartItems.map((localItem) => {
          const dbQuantity = dbCartMap.get(localItem.id) || 0
          return {
            user_id: userId,
            product_id: Number(localItem.id),
            quantity: dbQuantity + localItem.quantity, // Sum quantities
          }
        })

        if (itemsToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from("cart_items")
            .upsert(itemsToUpsert, { onConflict: "user_id,product_id" })
          if (upsertError) throw upsertError
        }

        if (typeof window !== "undefined") localStorage.removeItem(LOCAL_STORAGE_CART_KEY)
        console.log("[CartContext] Merge successful. Refetching cart.")
        await fetchUserCart(userId) // Refetch the merged cart
      } catch (error: any) {
        console.error("[CartContext] Error merging cart:", error)
        toast({
          title: "Cart Sync Error",
          description: "Could not sync local cart with server. Local items remain saved.",
          variant: "destructive",
        })
        // Don't clear local cart on merge error; keep local items.
        // Potentially set cartItems to a merged view of local + what might have been fetched before error
        setCartItems(localCartItems) // Or a more sophisticated merge if dbCartData was fetched
        setIsLoading(false)
      }
    },
    [supabase, fetchUserCart, toast],
  )

  useEffect(() => {
    if (!initializationAttempted || sessionLoading) return // Wait for Supabase init and auth state

    if (user && supabase) {
      const localCart = getCartFromLocalStorage()
      if (localCart.length > 0) {
        mergeLocalCartWithDb(user.id, localCart)
      } else {
        fetchUserCart(user.id)
      }
    } else {
      // Not logged in or Supabase not available
      if (user && !supabase) {
        console.warn("[CartContext] User logged in, but Supabase client unavailable. Loading cart from local storage.")
      }
      setCartItems(getCartFromLocalStorage())
      setIsLoading(false)
    }
  }, [user, sessionLoading, supabase, fetchUserCart, mergeLocalCartWithDb, initializationAttempted])

  useEffect(() => {
    // Save to local storage if not logged in, or if Supabase isn't connected
    // but only after initial loading is complete to avoid overwriting fetched data
    if (!isLoading && (!user || !isSupabaseConnected)) {
      saveCartToLocalStorage(cartItems)
    }
  }, [cartItems, user, isSupabaseConnected, isLoading])

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
      if (!user || !supabase) saveCartToLocalStorage(newItems)
      return newItems
    })
    toast({ title: "Added to Cart", description: `${product.name} has been added.` })

    if (user && supabase) {
      try {
        const { error } = await supabase
          .from("cart_items")
          .upsert(
            { user_id: user.id, product_id: Number(product.id), quantity: newQuantityInCart },
            { onConflict: "user_id,product_id" },
          )
        if (error) throw error
      } catch (error: any) {
        console.error("Error saving item to DB cart:", error)
        toast({ title: "Sync Error", description: "Could not save item to cloud.", variant: "destructive" })
        // Potentially revert local state or mark item as unsynced
      }
    }
  }

  const removeFromCart = async (productId: number) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== productId)
      if (!user || !supabase) saveCartToLocalStorage(newItems)
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
      if (!user || !supabase) saveCartToLocalStorage(newItems)
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
    if (!user || !supabase) saveCartToLocalStorage([])
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
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isSupabaseConnected,
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
