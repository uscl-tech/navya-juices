"use server"

import { createServerSupabase } from "./supabase"

export async function checkSupabaseConnection() {
  try {
    const supabase = createServerSupabase()

    // Simple query to check connection
    const { data, error } = await supabase
      .from("pg_catalog.pg_tables")
      .select("schemaname, tablename")
      .eq("schemaname", "public")
      .limit(1)

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error,
      }
    }

    // Get Supabase version
    const { data: versionData, error: versionError } = await supabase.rpc("pgclient", {
      query: "SELECT version();",
    })

    if (versionError) {
      return {
        success: true,
        connected: true,
        message: "Connected to Supabase, but couldn't retrieve version information",
        error: versionError.message,
      }
    }

    return {
      success: true,
      connected: true,
      version: versionData?.rows[0]?.version || "Unknown",
      message: "Successfully connected to Supabase",
    }
  } catch (error: any) {
    return {
      success: false,
      connected: false,
      error: error.message || "Unknown error",
      details: error,
    }
  }
}
