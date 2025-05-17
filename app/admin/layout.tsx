import type React from "react"
import { createServerSupabase } from "@/lib/supabase"
import { AdminSidebar } from "@/components/admin/sidebar"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current session
  const supabase = createServerSupabase()
  const { data } = await supabase.auth.getSession()
  const session = data.session

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login?redirect=/admin")
  }

  // Check if user is an admin
  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // If no profile or not admin, redirect to debug page
  if (error || !profile || profile.role !== "admin") {
    console.log("Admin access denied:", { error, profile })
    redirect("/admin-debug")
  }

  // If we get here, the user is authenticated and is an admin
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
