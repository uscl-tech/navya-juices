"use client"

import { useState } from "react"
import { setupDatabase, seedProducts } from "@/lib/db-setup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [setupResult, setSetupResult] = useState<{ success: boolean; message?: string; error?: any } | null>(null)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message?: string; error?: any } | null>(null)

  const handleSetupDatabase = async () => {
    setIsSettingUp(true)
    try {
      const result = await setupDatabase()
      setSetupResult(result)
    } catch (error) {
      setSetupResult({ success: false, error })
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    try {
      const result = await seedProducts()
      setSeedResult(result)
    } catch (error) {
      setSeedResult({ success: false, error })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Supabase Setup</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Database Schema Setup</CardTitle>
            <CardDescription>Create the necessary tables and functions for the application</CardDescription>
          </CardHeader>
          <CardContent>
            {setupResult && (
              <div
                className={`p-4 rounded-md mb-4 ${
                  setupResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {setupResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <p>{setupResult.success ? "Setup completed successfully!" : "Setup failed"}</p>
                </div>
                {setupResult.message && <p className="mt-2">{setupResult.message}</p>}
                {setupResult.error && (
                  <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                    {JSON.stringify(setupResult.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSetupDatabase} disabled={isSettingUp}>
              {isSettingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up...
                </>
              ) : (
                "Setup Database Schema"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>Populate the database with initial products and challenges</CardDescription>
          </CardHeader>
          <CardContent>
            {seedResult && (
              <div
                className={`p-4 rounded-md mb-4 ${
                  seedResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {seedResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <p>{seedResult.success ? "Seeding completed successfully!" : "Seeding failed"}</p>
                </div>
                {seedResult.message && <p className="mt-2">{seedResult.message}</p>}
                {seedResult.error && (
                  <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                    {JSON.stringify(seedResult.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSeedDatabase} disabled={isSeeding || !setupResult?.success}>
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                "Seed Database"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
