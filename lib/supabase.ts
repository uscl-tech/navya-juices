import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Create a singleton instance for client-side usage
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase environment variables")
        throw new Error("Supabase configuration is missing. Please check your environment variables.")
      }

      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
      console.log("Supabase client initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      throw error
    }
  }
  return supabaseInstance
}

// For server components and server actions
export const createServerSupabase = () => {
  return createClient<Database>(
    process.env.SUPABASE_URL || (process.env.NEXT_PUBLIC_SUPABASE_URL as string),
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
      },
    },
  )
}
