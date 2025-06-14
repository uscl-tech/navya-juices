"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase" // Make sure this path is correct

export default function SupabaseTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runSupabaseTest = async () => {
      setIsLoading(true)
      console.log("[SupabaseTestPage] Initializing test...")

      const supabase = getSupabase()
      if (!supabase) {
        console.error("[SupabaseTestPage] Failed to get Supabase client instance.")
        setTestResult(
          "Test Failed: Supabase client could not be initialized. Check lib/supabase.ts and environment variables.",
        )
        setIsLoading(false)
        return
      }
      console.log("[SupabaseTestPage] Supabase client instance obtained.")
      console.log(
        "[SupabaseTestPage] Attempting a simple query to a (intentionally) non-existent table to test connection...",
      )

      try {
        const { data, error, status } = await supabase
          .from("__connection_test_table__") // This table is not expected to exist
          .select("id")
          .limit(1)

        console.log(`[SupabaseTestPage] Supabase query completed. Status: ${status}`)

        if (error) {
          console.log(`[SupabaseTestPage] Supabase returned an error: ${error.message} (Code: ${error.code})`)
          if (error.code === "42P01" || status === 404) {
            // '42P01' is "undefined_table" in PostgreSQL
            setTestResult(
              `SUCCESSFUL CONNECTION TEST: Supabase responded (table not found, code ${error.code || status}). This means the connection, CORS, and Auth (anon key) are likely working for basic requests.`,
            )
          } else {
            setTestResult(
              `Test Partially Failed: Connected but Supabase returned an unexpected error. Status: ${status}, Code: ${error.code}, Message: ${error.message}`,
            )
          }
        } else {
          // This case should ideally not be hit if the table truly doesn't exist.
          console.log("[SupabaseTestPage] Supabase query returned data (unexpected for non-existent table):", data)
          setTestResult("Test Ambiguous: Query succeeded for a non-existent table? Check table name.")
        }
      } catch (e: any) {
        // This catch block is for "TypeError: Failed to fetch" or similar low-level errors
        console.error("[SupabaseTestPage] Exception during Supabase query:", e)
        if (e.message && e.message.toLowerCase().includes("failed to fetch")) {
          setTestResult(
            `TEST FAILED (LOW-LEVEL): "${e.message}". This indicates a fundamental issue like CORS, incorrect Supabase URL/Key in Vercel, or network block preventing connection to Supabase.`,
          )
        } else {
          setTestResult(`Test Failed with Exception: ${e.message || "Unknown error"}`)
        }
      } finally {
        setIsLoading(false)
        console.log("[SupabaseTestPage] Test finished.")
      }
    }

    runSupabaseTest()
  }, [])

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Supabase Connection Test Page</h1>
      {isLoading ? (
        <p>Running test...</p>
      ) : (
        <div>
          <h2>Test Result:</h2>
          <pre
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              border: "1px solid #ccc",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {testResult || "No result yet."}
          </pre>
        </div>
      )}
      <p>Check the browser console for detailed logs prefixed with [SupabaseTestPage].</p>
    </div>
  )
}
