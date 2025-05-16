"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkSupabaseConnection } from "@/lib/supabase-debug"

export default function DebugPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)

  const checkConnection = async () => {
    setStatus("loading")
    try {
      const result = await checkSupabaseConnection()
      setResult(result)
      setStatus(result.success ? "success" : "error")
    } catch (error) {
      console.error("Error checking connection:", error)
      setResult(error)
      setStatus("error")
    }
  }

  // Log environment variables on mount (client-side only)
  useEffect(() => {
    console.log("Environment variables check (client-side):")
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Debug</CardTitle>
            <CardDescription>Check if your Supabase connection is working properly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Environment Variables (Client-Side)</h3>
                <p className="text-sm">
                  NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
                </p>
                <p className="text-sm">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
                </p>
              </div>

              {status === "loading" && (
                <div className="text-center py-4">
                  <p>Testing connection...</p>
                </div>
              )}

              {status === "success" && (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-800 font-medium">✅ Connection successful!</p>
                  <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {status === "error" && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-800 font-medium">❌ Connection failed!</p>
                  <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={checkConnection} className="w-full">
              Test Supabase Connection
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Troubleshooting Steps</h2>
          <div className="space-y-2">
            <h3 className="font-medium">1. Check Environment Variables</h3>
            <p className="text-sm text-muted-foreground">
              Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in your .env.local
              file or Vercel project settings.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">2. Verify Supabase Project</h3>
            <p className="text-sm text-muted-foreground">
              Ensure your Supabase project is active and the API keys are correct. You can check this in the Supabase
              dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">3. Check Network Access</h3>
            <p className="text-sm text-muted-foreground">
              Make sure your application has network access to Supabase. Check for any firewall or CORS issues.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">4. Restart Development Server</h3>
            <p className="text-sm text-muted-foreground">
              Sometimes restarting your development server after updating environment variables helps.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
