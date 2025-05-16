import { getSupabase, createServerSupabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Product = Database["public"]["Tables"]["products"]["Row"]

// Client-side product service
export const productService = {
  async getAll() {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("products").select("*")

    if (error) {
      console.error("Error fetching products:", error)
      throw error
    }

    return data
  },

  async getById(id: number) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching product with id ${id}:`, error)
      throw error
    }

    return data
  },

  async getByCategory(category: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("products").select("*").eq("category", category)

    if (error) {
      console.error(`Error fetching products in category ${category}:`, error)
      throw error
    }

    return data
  },

  async getFeatured() {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("products").select("*").eq("is_featured", true)

    if (error) {
      console.error("Error fetching featured products:", error)
      throw error
    }

    return data
  },
}

// Server-side product service
export const serverProductService = {
  async getAll() {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("products").select("*")

    if (error) {
      console.error("Error fetching products:", error)
      throw error
    }

    return data
  },

  async getById(id: number) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching product with id ${id}:`, error)
      throw error
    }

    return data
  },

  async getByCategory(category: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("products").select("*").eq("category", category)

    if (error) {
      console.error(`Error fetching products in category ${category}:`, error)
      throw error
    }

    return data
  },

  async getFeatured() {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("products").select("*").eq("is_featured", true)

    if (error) {
      console.error("Error fetching featured products:", error)
      throw error
    }

    return data
  },
}
