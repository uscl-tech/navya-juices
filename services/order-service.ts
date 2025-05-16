import { getSupabase, createServerSupabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import type { CartItem } from "@/context/cart-context"
import type { Address } from "@/services/address-service"

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"]

// Client-side order service
export const orderService = {
  async getAll(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw error
    }

    return data
  },

  async getById(id: string, userId: string) {
    const supabase = getSupabase()
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (orderError) {
      console.error(`Error fetching order with id ${id}:`, orderError)
      throw orderError
    }

    const { data: orderItems, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", id)

    if (itemsError) {
      console.error(`Error fetching items for order ${id}:`, itemsError)
      throw itemsError
    }

    return { ...order, items: orderItems }
  },

  async create(userId: string, items: CartItem[], shippingAddress: Address, paymentMethod: string, shippingFee = 0) {
    const supabase = getSupabase()

    // Calculate totals
    const subtotal = items.reduce((total, item) => {
      const price = Number.parseFloat(item.price.replace("$", ""))
      return total + price * item.quantity
    }, 0)

    const total = subtotal + shippingFee

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        payment_method: paymentMethod,
        subtotal,
        shipping_fee: shippingFee,
        total,
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw orderError
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: Number.parseFloat(item.price.replace("$", "")),
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      throw itemsError
    }

    return order
  },
}

// Server-side order service
export const serverOrderService = {
  async getAll(userId: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw error
    }

    return data
  },

  async getById(id: string, userId: string) {
    const supabase = createServerSupabase()
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (orderError) {
      console.error(`Error fetching order with id ${id}:`, orderError)
      throw orderError
    }

    const { data: orderItems, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", id)

    if (itemsError) {
      console.error(`Error fetching items for order ${id}:`, itemsError)
      throw itemsError
    }

    return { ...order, items: orderItems }
  },
}
