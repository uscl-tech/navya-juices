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

  // Fetch user role from the 'profiles' table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle() // Use maybeSingle()

  if (profileError) {
    // This error from maybeSingle() implies multiple rows were found.
    console.error("Error fetching role from profiles table (likely multiple rows):", profileError.message)
    return { user, role: "customer", error: profileError } // Default to 'customer' on error
  }

  if (!profileData) {
    // No profile found for this user.
    console.warn(`Server-utils: Profile not found for user ${user.id}. Assigning default role 'customer'.`)
    // This is a good place to consider if a server-side profile creation/repair mechanism is needed
    // if a profile is absolutely expected. For now, default the role.
    return { user, role: "customer", error: null }
  }

  const role = profileData.role || "customer" // Default to 'customer' if role is null in DB

  return { user, role: role as string, error: null }
}

// Utility to specifically check for admin role
export async function isAdmin(): Promise<boolean> {
  const { role, error } = await getAuthenticatedUserAndRole()
  if (error) return false
  return role === "admin"
}
