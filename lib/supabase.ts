import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Ensure these are being correctly picked up from your environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    // Check explicitly for undefined or empty strings
    if (!supabaseUrl || supabaseUrl.trim() === "") {
      console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not defined or empty. Please check environment variables.")
      throw new Error("Supabase URL is missing. App cannot function.")
    }
    if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
      console.error(
        "CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined or empty. Please check environment variables.",
      )
      throw new Error("Supabase Anon Key is missing. App cannot function.")
    }

    try {
      console.log(`Initializing Supabase client with URL: ${supabaseUrl.substring(0, 20)}...`) // Log part of URL for verification
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
      console.log("Supabase client initialized successfully.")
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      // This error would typically prevent further Supabase calls
      throw error
    }
  }
  return supabaseInstance
}

// For server components and server actions
export const createServerSupabase = () => {
  const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serverSupabaseUrl || serverSupabaseUrl.trim() === "") {
    console.error("CRITICAL: Server Supabase URL is not defined or empty.")
    throw new Error("Server Supabase URL is missing.")
  }
  if (!serviceRoleKey || serviceRoleKey.trim() === "") {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not defined or empty.")
    throw new Error("Supabase Service Role Key is missing.")
  }

  return createClient<Database>(serverSupabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}
