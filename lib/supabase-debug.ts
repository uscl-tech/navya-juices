import { createClient } from "@supabase/supabase-js"

export async function checkSupabaseConnection() {
  console.log("Checking Supabase connection...")

  // Log environment variables (without exposing sensitive values)
  console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Try a simple query to test the connection
    const { data, error } = await supabase.from("addresses").select("count()", { count: "exact" })

    if (error) {
      throw error
    }

    console.log("Supabase connection successful:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Supabase connection error:", error)
    return { success: false, error }
  }
}
