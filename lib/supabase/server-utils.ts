import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase" // Assuming your generated types

export async function getAuthenticatedUserAndRole() {
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
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    console.error("Error getting session or user:", sessionError?.message)
    return { user: null, role: null, error: sessionError || new Error("User not authenticated") }
  }

  const user = session.user

  // Fetch user role. This needs to align with how you store roles.
  // Option 1: From a 'user_roles' table (adjust table/column names as needed)
  /*
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError) {
    console.error('Error fetching role from user_roles table:', roleError.message)
    // Fallback or default role if not found, or handle error appropriately
    return { user, role: 'customer', error: roleError }
  }
  const role = roleData?.role || 'customer';
  */

  // Option 2: From user's app_metadata (as used in AuthContext and previous examples)
  // Ensure app_metadata is populated correctly (e.g., via a trigger on user creation or admin update)
  const role = user.app_metadata?.user_role || "customer" // Default to 'customer'

  return { user, role: role as string, error: null }
}

// Utility to specifically check for admin role
export async function isAdmin(): Promise<boolean> {
  const { role, error } = await getAuthenticatedUserAndRole()
  if (error) return false
  return role === "admin"
}
