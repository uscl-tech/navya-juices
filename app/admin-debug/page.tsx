import { createServerSupabase } from "@/lib/supabase"
import Link from "next/link"

async function checkAuth() {
  const supabase = createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      authenticated: false,
      user: null,
      profile: null,
      isAdmin: false,
      error: null,
    }
  }

  try {
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return {
      authenticated: true,
      user: session.user,
      profile,
      isAdmin: profile?.role === "admin",
      error,
    }
  } catch (error) {
    return {
      authenticated: true,
      user: session.user,
      profile: null,
      isAdmin: false,
      error,
    }
  }
}

export default async function AdminDebugPage() {
  const { authenticated, user, profile, isAdmin, error } = await checkAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-primary text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Access Debug</h1>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            {authenticated ? (
              <div className="flex items-center text-green-600 mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Authentication Successful</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Not Authenticated</span>
              </div>
            )}

            {authenticated && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">You are logged in as {user?.email}.</p>
                <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {authenticated && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              {profile ? (
                <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(profile, null, 2)}</pre>
                </div>
              ) : error ? (
                <div className="text-red-600 mb-4">
                  <p className="font-medium">Profile error: {error.message}</p>
                  <div className="bg-red-50 p-4 rounded-lg mt-2 overflow-auto max-h-60">
                    <pre className="text-xs">{JSON.stringify(error, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-yellow-600">No profile found for this user.</p>
              )}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Admin Status</h2>
            {isAdmin ? (
              <div className="flex items-center text-green-600 mb-4">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Admin Access Confirmed</span>
              </div>
            ) : authenticated ? (
              <div className="flex items-center text-red-600 mb-4">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">No Admin Access</span>
              </div>
            ) : (
              <p className="text-gray-600">Please log in to check admin status.</p>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Go to Admin Dashboard
              </Link>
            )}

            {authenticated && !isAdmin && (
              <button className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Create Admin Profile
              </button>
            )}

            {!authenticated && (
              <Link
                href="/login?redirect=/admin-debug"
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Log In
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t">
          <h3 className="text-lg font-medium text-gray-900">Troubleshooting Steps</h3>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Make sure you're logged in with the correct account (currently: {user?.email || "Not logged in"})</li>
            <li>If you don't have a profile, use the "Create Admin Profile" button above</li>
            <li>Verify that your profile has role="admin"</li>
            <li>Clear your browser cache and cookies, then try again</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
