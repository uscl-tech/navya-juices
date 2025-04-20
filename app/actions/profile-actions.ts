"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"

type ProfileData = {
  fullName: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

export async function getProfile(userId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return { success: false, error: error.message }
    }

    return { success: true, profile: data }
  } catch (error) {
    console.error("Unexpected error fetching profile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateProfile(userId: string, profileData: ProfileData) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postalCode,
        country: profileData.country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating profile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
