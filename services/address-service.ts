import { getSupabase, createServerSupabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Address = Database["public"]["Tables"]["addresses"]["Row"]
export type AddressInsert = Database["public"]["Tables"]["addresses"]["Insert"]
export type AddressUpdate = Database["public"]["Tables"]["addresses"]["Update"]

// Client-side address service
export const addressService = {
  async getAll(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("addresses").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching addresses:", error)
      throw error
    }

    return data
  },

  async getById(id: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("addresses").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching address with id ${id}:`, error)
      throw error
    }

    return data
  },

  async getDefault(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error fetching default address:", error)
      throw error
    }

    return data || null
  },

  async create(address: AddressInsert) {
    const supabase = getSupabase()

    // If this is the default address, unset any existing default
    if (address.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id)
        .eq("is_default", true)
    }

    const { data, error } = await supabase.from("addresses").insert(address).select().single()

    if (error) {
      console.error("Error creating address:", error)
      throw error
    }

    return data
  },

  async update(id: string, address: AddressUpdate) {
    const supabase = getSupabase()

    // If this is being set as default, unset any existing default
    if (address.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id)
        .eq("is_default", true)
    }

    const { data, error } = await supabase.from("addresses").update(address).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating address with id ${id}:`, error)
      throw error
    }

    return data
  },

  async delete(id: string) {
    const supabase = getSupabase()
    const { error } = await supabase.from("addresses").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting address with id ${id}:`, error)
      throw error
    }

    return true
  },
}

// Server-side address service
export const serverAddressService = {
  async getAll(userId: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("addresses").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching addresses:", error)
      throw error
    }

    return data
  },

  async getById(id: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("addresses").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching address with id ${id}:`, error)
      throw error
    }

    return data
  },

  async getDefault(userId: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error fetching default address:", error)
      throw error
    }

    return data || null
  },
}
