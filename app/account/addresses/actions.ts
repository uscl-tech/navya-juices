"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getAuthenticatedUserAndRole } from "@/lib/supabase/server-utils" // Updated path
import type { Database } from "@/types/supabase"

// Schema for address data, mirroring AddressFormValues but for server action
const addressActionSchema = z.object({
  id: z.string().optional(), // For updates
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address_line1: z.string().min(5, "Address must be at least 5 characters"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(5, "Postal code is required"),
  is_default: z.boolean().default(false),
  internal_notes: z.string().optional(),
  // For admin actions:
  userIdForAdmin: z.string().optional(), // ID of the user whose address is being modified by admin
  isAdminView: z.boolean().optional(), // Indicates if action is from an admin context
})

export type AddressActionValues = z.infer<typeof addressActionSchema>

export async function saveAddressAction(formData: AddressActionValues) {
  const { user, role, error: authError } = await getAuthenticatedUserAndRole()

  if (authError || !user) {
    return { success: false, message: authError?.message || "Authentication required." }
  }

  const validation = addressActionSchema.safeParse(formData)
  if (!validation.success) {
    return { success: false, message: "Invalid data.", errors: validation.error.flatten().fieldErrors }
  }

  const data = validation.data
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  let effectiveUserId = user.id
  // If an admin is performing this action for another user
  if (data.isAdminView && data.userIdForAdmin && role === "admin") {
    effectiveUserId = data.userIdForAdmin
  } else if (data.isAdminView && data.userIdForAdmin && role !== "admin") {
    return { success: false, message: "Unauthorized: Admin privileges required to modify other users' addresses." }
  }

  const dataToSave: any = {
    // Type assertion for Supabase client
    name: data.name,
    phone: data.phone,
    address_line1: data.address_line1,
    address_line2: data.address_line2,
    city: data.city,
    state: data.state,
    postal_code: data.postal_code,
    is_default: data.is_default,
    user_id: effectiveUserId,
  }

  // Include internal_notes only if it's an admin view and notes are provided
  // This assumes your 'addresses' table has an 'internal_notes' column.
  if ((data.isAdminView || role === "admin") && data.internal_notes) {
    dataToSave.internal_notes = data.internal_notes
  }

  try {
    // If this is set as default, update all other addresses for the effectiveUser to not be default
    if (data.is_default) {
      const { error: updateError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", effectiveUserId)
      if (updateError) throw updateError
    }

    let upsertError
    if (data.id) {
      // Update existing address
      const { error } = await supabase
        .from("addresses")
        .update(dataToSave)
        .eq("id", data.id)
        .eq("user_id", effectiveUserId) // RLS should also enforce this, but good for defense in depth
      upsertError = error
    } else {
      // Insert new address
      const { error } = await supabase.from("addresses").insert(dataToSave)
      upsertError = error
    }

    if (upsertError) {
      throw upsertError
    }

    revalidatePath("/account/addresses") // Or wherever addresses are listed
    if (role === "admin" && data.userIdForAdmin) {
      revalidatePath(`/admin/users/${data.userIdForAdmin}/addresses`) // Example admin path
    }
    return { success: true, message: "Address saved successfully." }
  } catch (err: any) {
    console.error("Error saving address:", err)
    return { success: false, message: err.message || "Failed to save address. Please try again." }
  }
}
