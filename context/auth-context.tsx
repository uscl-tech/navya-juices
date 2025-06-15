"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabase } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean // True while initializing client, fetching session, or user role
  userRole: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  isSupabaseInitialized: boolean // Indicates if getSupabase() returned a client
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true until everything is resolved
  const [userRole, setUserRole] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(false)

  // Step 1: Initialize Supabase Client
  useEffect(() => {
    console.log("[AuthContext] Attempting Supabase client initialization...")
    const client = getSupabase()
    if (client) {
      setSupabase(client)
      setIsSupabaseInitialized(true)
      console.log("[AuthContext] Supabase client initialized successfully.")
    } else {
      console.error("[AuthContext] CRITICAL: Supabase client failed to initialize. Auth will not function.")
      setIsSupabaseInitialized(false)
      setIsLoading(false) // Stop loading if Supabase isn't even available
    }
  }, [])

  const fetchUserRole = useCallback(async (userId: string, currentSupabase: SupabaseClient) => {
    if (!userId) {
      console.warn("[AuthContext] fetchUserRole: No userId provided.")
      return null
    }
    console.log(`[AuthContext] fetchUserRole: Fetching role for user ID: ${userId}`)
    try {
      const { data, error, status } = await currentSupabase.from("profiles").select("role").eq("id", userId).single()

      if (error) {
        console.error(`[AuthContext] fetchUserRole: Error fetching role. Status: ${status}`, error)
        if (status === 404) console.warn(`[AuthContext] fetchUserRole: Profile not found for user ${userId}.`)
        return null // Default to null if role cannot be fetched
      }
      const role = data?.role || null
      console.log(`[AuthContext] fetchUserRole: Successfully fetched role: ${role} for user ${userId}`)
      return role
    } catch (error) {
      console.error("[AuthContext] fetchUserRole: Unexpected error:", error)
      return null
    }
  }, [])

  // Step 2: Handle Auth State Changes (after Supabase client is initialized)
  useEffect(() => {
    if (!supabase || !isSupabaseInitialized) {
      if (!isSupabaseInitialized && isLoading) {
        // console.log("[AuthContext] Auth state effect: Supabase not initialized, isLoading remains true or set to false by init step.");
      } else if (isSupabaseInitialized && !supabase && isLoading) {
        console.warn(
          "[AuthContext] Auth state effect: Supabase initialized flag is true, but client is null. Setting isLoading to false.",
        )
        setIsLoading(false)
      }
      return
    }

    console.log("[AuthContext] Auth state effect: Subscribing to onAuthStateChange.")
    setIsLoading(true)

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error: sessionError }) => {
        console.log("[AuthContext] getSession(): Initial session fetch completed.")
        if (sessionError) {
          console.error("[AuthContext] getSession(): Error fetching initial session:", sessionError)
        }

        if (initialSession) {
          console.log(`[AuthContext] getSession(): Active initial session. User: ${initialSession.user?.id}`)
          setSession(initialSession)
          setUser(initialSession.user ?? null)
          if (initialSession.user) {
            const role = await fetchUserRole(initialSession.user.id, supabase)
            setUserRole(role)
          } else {
            setUserRole(null)
          }
        } else {
          console.log("[AuthContext] getSession(): No active initial session.")
          setSession(null)
          setUser(null)
          setUserRole(null)
        }
      })
      .catch((catchError) => {
        console.error("[AuthContext] getSession(): Unexpected error during initial session fetch:", catchError)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log(`[AuthContext] onAuthStateChange: Event - ${_event}. User: ${newSession?.user?.id ?? "none"}`)
      setSession(newSession)
      const currentUser = newSession?.user ?? null
      setUser(currentUser)
      let currentRole = null // temp var for logging
      if (currentUser) {
        currentRole = await fetchUserRole(currentUser.id, supabase)
        setUserRole(currentRole)
      } else {
        setUserRole(null)
      }
      console.log(
        `[AuthContext] onAuthStateChange: Processed. User: ${currentUser?.id}, Role: ${currentRole}. Setting isLoading to false.`,
      )
      setIsLoading(false)
    })

    return () => {
      console.log("[AuthContext] Auth state effect: Unsubscribing from onAuthStateChange.")
      subscription.unsubscribe()
    }
  }, [supabase, isSupabaseInitialized, fetchUserRole])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { message: "Authentication service not available." } }
    console.log(`[AuthContext] signIn: Attempting for ${email}`)
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error("[AuthContext] signIn: Error:", error)
        setIsLoading(false)
        return { error }
      }
      console.log("[AuthContext] signIn: signInWithPassword successful. User:", data.user?.id)
      return { error: null }
    } catch (catchError: any) {
      console.error("[AuthContext] signIn: Unexpected error:", catchError)
      setIsLoading(false)
      return { error: { message: catchError.message || "An unexpected error occurred." } }
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      console.error("[AuthContext] signUp: Supabase client not available.")
      setIsLoading(false)
      return { data: null, error: { message: "Authentication service not available. Please try again later." } }
    }
    console.log(`[AuthContext] signUp: Attempting for ${email}`)
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        console.error("[AuthContext] signUp: Supabase auth error:", error)
        // The error object from Supabase should be returned
      } else {
        console.log("[AuthContext] signUp: Successful. User:", data.user?.id)
      }

      if (!data.session && data.user) {
        // Typical for email verification pending
        setIsLoading(false)
      } else if (!data.user && !data.session && !error) {
        // If signup returns no user, no session, and no error
        setIsLoading(false)
      }
      // If there's an error, onAuthStateChange might not fire, or if it does, it will set isLoading.
      // If signup is successful and leads to a state change (SIGNED_IN), onAuthStateChange handles isLoading.
      // If signup is successful but requires email verification (no immediate session), isLoading needs to be false here.

      return { data, error }
    } catch (catchError: any) {
      // THIS BLOCK RUNS WHEN "Failed to fetch" HAPPENS
      console.error("[AuthContext] signUp: Unexpected network or other error:", catchError)
      setIsLoading(false)
      return {
        data: null,
        error: {
          message:
            "Sign up failed. This could be due to a network issue or a problem with the authentication service. Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.",
        },
      }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      console.error("[AuthContext] signOut: Supabase client not available.")
      return
    }
    console.log("[AuthContext] signOut: Signing out user.")
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("[AuthContext] signOut: Error:", error)
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: { message: "Authentication service not available." } }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    session,
    isLoading,
    userRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isSupabaseInitialized,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
