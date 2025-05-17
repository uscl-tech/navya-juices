import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Check if the request is for the admin area
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to login with return URL
    if (!session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // If not admin, redirect to unauthorized page
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return response
}

// Only run middleware on admin routes
export const config = {
  matcher: "/admin/:path*",
}
