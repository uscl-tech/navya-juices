"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware handles authentication and authorization
  const { user, userRole, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login?message=Please log in to access the admin area.")
      } else if (userRole !== "admin") {
        router.push("/unauthorized?message=You are not authorized to view this page.")
      }
    }
  }, [user, userRole, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication status...</p>
      </div>
    )
  }

  if (!user || userRole !== "admin") {
    // This will be shown briefly before redirection, or if redirection fails.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
