"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import Link from "next/link"

export default function AdminDebugPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)
        const supabase = getSupabase()

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`)
        }

        if (!session) {
          throw new Error("No active session found")
        }

        setUser(session.user)

        // Get user profile with simplified query
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          // Handle profile not found more gracefully
          if (profileError.code === "PGRST116") {
            setProfile(null)
          } else {
            throw new Error(`Profile error: ${profileError.message}`)
          }
        } else {
          setProfile(profileData)
        }
      } catch (err: any) {
        setError(err.message)
        console.error("Debug error:", err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Function to create admin profile if missing
  async function createAdminProfile() {
    if (!user) return

    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          role: "admin",
          full_name: user.user_metadata?.full_name || "Admin User",
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setError(null)
    } catch (err: any) {
      setError(`Failed to create profile: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Access Debug</h1>

      {loading ? (
        <p>Loading authentication status...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
          <div className="mt-4">
            <Link href="/login?redirect=/admin-debug" className="text-blue-600 underline">
              Try logging in again
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
            <h2 className="font-bold">✅ Authentication Successful</h2>
            <p>You are logged in as {user?.email}.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
            <h2 className="font-bold text-xl mb-2">User Information</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">{JSON.stringify(user, null, 2)}</pre>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
            <h2 className="font-bold text-xl mb-2">Profile Information</h2>
            {profile ? (
              <>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm mb-4">
                  {JSON.stringify(profile, null, 2)}
                </pre>

                {profile.role === "admin" ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
                    <h3 className="font-bold">✅ Admin Access Confirmed</h3>
                    <p>Your account has admin privileges.</p>
                    <div className="mt-4">
                      <Link href="/admin" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Go to Admin Dashboard
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
                    <h3 className="font-bold">⚠️ Not an Admin</h3>
                    <p>Your account does not have admin privileges. Role: {profile.role || "not set"}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
                <h3 className="font-bold">⚠️ No Profile Found</h3>
                <p>You don't have a profile record in the database.</p>
                <button
                  onClick={createAdminProfile}
                  disabled={loading}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Admin Profile"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-xl">Troubleshooting Steps</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Make sure you're logged in with the correct account (currently: {user?.email})</li>
              <li>If you don't have a profile, use the "Create Admin Profile" button above</li>
              <li>Verify that your profile has role="admin"</li>
              <li>Clear your browser cache and cookies, then try again</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
