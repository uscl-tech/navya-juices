"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { getSupabase } from "@/lib/supabase" // We need this for role check

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleRedirect = async () => {
      if (user) {
        // User is logged in, now decide where to redirect.
        const redirectParam = searchParams.get("redirect")

        // Check user role to handle admin redirects correctly
        const supabase = getSupabase()
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role === "admin") {
          // If admin, redirect to admin dashboard or specified admin page
          if (redirectParam && redirectParam.startsWith("/admin")) {
            router.push(redirectParam)
          } else {
            router.push("/admin")
          }
        } else {
          // For regular users, redirect to account or specified non-admin page
          if (redirectParam && !redirectParam.startsWith("/admin")) {
            router.push(redirectParam)
          } else {
            router.push("/account")
          }
        }
      }
    }

    if (!isLoading) {
      handleRedirect()
    }
  }, [user, isLoading, router, searchParams])

  // While checking auth state, or if user is already logged in and we are preparing redirect
  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
          <p className="text-sm text-muted-foreground">Finalizing authentication...</p>
        </div>
      </div>
    )
  }

  // If not loading and no user, show the login form.
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <LoginForm />
    </div>
  )
}
