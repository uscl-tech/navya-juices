import { createServerSupabase } from "@/lib/supabase"
import { redirect } from "next/navigation"

export async function checkAdminAccess() {
  const supabase = createServerSupabase()

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return { user: session.user, profile }
}
