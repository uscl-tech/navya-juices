import { createServerSupabase } from "@/lib/supabase"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminDirectPage() {
  try {
    // Get the current session
    const supabase = createServerSupabase()
    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="mb-6 text-gray-600">You need to be logged in to access the admin dashboard.</p>
            <Link
              href="/login?redirect=/admin-direct"
              className="block w-full bg-primary text-white py-2 px-4 rounded text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      )
    }

    // Check if user is an admin
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (error || !profile || profile.role !== "admin") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
            <p className="mb-6 text-gray-600">Your account does not have admin privileges.</p>
            <Link href="/admin-debug" className="block w-full bg-primary text-white py-2 px-4 rounded text-center">
              Check Admin Status
            </Link>
          </div>
        </div>
      )
    }

    // If user is authenticated and has admin role, redirect to admin dashboard
    return redirect("/admin")
  } catch (error) {
    console.error("Error in admin direct page:", error)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6 text-gray-600">An error occurred while checking admin access.</p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm mb-4">{JSON.stringify(error, null, 2)}</pre>
          <Link href="/admin-debug" className="block w-full bg-primary text-white py-2 px-4 rounded text-center">
            Try Admin Debug Page
          </Link>
        </div>
      </div>
    )
  }
}
