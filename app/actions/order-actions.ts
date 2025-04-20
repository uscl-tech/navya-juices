"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import type { CartItem } from "@/context/cart-context"

type ShippingAddress = {
  fullName: string
  email: string
  address: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

// Update the createOrder function to include better validation
export async function createOrder(userId: string, items: CartItem[], total: number, shippingAddress: ShippingAddress) {
  try {
    // Validate inputs
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (!items || items.length === 0) {
      return { success: false, error: "No items in cart" }
    }

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return { success: false, error: "Shipping address is incomplete" }
    }

    const supabase = createServerClient()

    // Calculate total from items to ensure it matches
    const calculatedTotal = items.reduce((sum, item) => {
      // Handle price format consistently
      const price = typeof item.price === "string" ? Number.parseFloat(item.price.replace("$", "")) : item.price
      return sum + price * item.quantity
    }, 0)

    // Add shipping cost
    const shippingCost = 4.99
    const finalTotal = calculatedTotal + shippingCost

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total: finalTotal.toFixed(2),
        shipping_address: shippingAddress,
        status: "processing",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { success: false, error: orderError.message }
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: typeof item.price === "string" ? Number.parseFloat(item.price.replace("$", "")) : item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // If there's an error with order items, we should delete the order to avoid orphaned records
      await supabase.from("orders").delete().eq("id", order.id)
      return { success: false, error: itemsError.message }
    }

    revalidatePath("/account")
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Unexpected error creating order:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getOrders(userId: string) {
  try {
    const supabase = createServerClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return { success: false, error: error.message }
    }

    return { success: true, orders }
  } catch (error) {
    console.error("Unexpected error fetching orders:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getOrderDetails(orderId: string, userId: string) {
  try {
    const supabase = createServerClient()

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return { success: false, error: orderError.message }
    }

    // Get the order items
    const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId)

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
      return { success: false, error: itemsError.message }
    }

    return { success: true, order, items }
  } catch (error) {
    console.error("Unexpected error fetching order details:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
