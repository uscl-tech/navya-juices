import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: SupabaseClient<Database> | null = null
let initializationError: Error | null = null
let hasLoggedInitialization = false // Prevent spamming logs

export const getSupabase = (): SupabaseClient<Database> | null => {
  if (initializationError) {
    if (!hasLoggedInitialization) {
      console.error(
        "[SupabaseClient] Returning null due to previous initialization error:",
        initializationError.message,
      )
      hasLoggedInitialization = true
    }
    return null
  }

  if (!supabaseInstance) {
    if (!supabaseUrl || supabaseUrl.trim() === "") {
      initializationError = new Error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not defined or empty.")
      console.error(initializationError.message)
      hasLoggedInitialization = true
      return null
    }
    if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
      initializationError = new Error("CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined or empty.")
      console.error(initializationError.message)
      hasLoggedInitialization = true
      return null
    }

    try {
      if (!hasLoggedInitialization) {
        console.log(`[SupabaseClient] Initializing with URL: ${supabaseUrl.substring(0, 30)}...`)
      }
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
      if (!hasLoggedInitialization) {
        console.log("[SupabaseClient] Initialized successfully.")
      }
      initializationError = null // Clear error on success
      hasLoggedInitialization = true // Logged success or first attempt
    } catch (error: any) {
      initializationError = new Error(`[SupabaseClient] Failed to initialize: ${error.message}`)
      console.error(initializationError.message, error)
      hasLoggedInitialization = true
      supabaseInstance = null // Ensure instance is null on error
    }
  }
  return supabaseInstance
}

// For server components and server actions - this remains largely the same
// but ensure it also throws or logs clearly if env vars are missing.
export const createServerSupabase = () => {
  const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serverSupabaseUrl || serverSupabaseUrl.trim() === "") {
    const errorMsg =
      "CRITICAL: Server Supabase URL (SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL) is not defined or empty for server client."
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
  if (!serviceRoleKey || serviceRoleKey.trim() === "") {
    const errorMsg = "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not defined or empty for server client."
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  return createClient<Database>(serverSupabaseUrl, serviceRoleKey, {
    auth: {
      // Generally, for server-side clients used in Route Handlers or Server Actions,
      // you might not want to persist session cookies this way,
      // as the Supabase SSR helpers (createServerClient) handle cookie management.
      // If this is for a generic server-side utility not in the request-response cycle,
      // `persistSession: false` is appropriate.
      persistSession: false,
      // autoRefreshToken: false, // Consider if not managing sessions here
      // detectSessionInUrl: false, // Consider if not managing sessions here
    },
  })
}
