"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabase } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  userRole: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = getSupabase()

  // Add this function to fetch user role
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user role:", error)
        return null
      }

      return data?.role || null
    } catch (error) {
      console.error("Unexpected error fetching user role:", error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    async function getSession() {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (mounted) {
          if (error) {
            console.error("Error getting session:", error)
          } else {
            setSession(session)
            setUser(session?.user ?? null)
          }
        }
      } catch (error) {
        console.error("Unexpected error during getSession:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Update the useEffect to fetch role when user changes
  useEffect(() => {
    if (user) {
      fetchUserRole(user.id).then((role) => {
        setUserRole(role)
      })
    } else {
      setUserRole(null)
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      console.error("Error during sign in:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      return { data, error }
    } catch (error) {
      console.error("Error during sign up:", error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error during sign out:", error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Error during password reset:", error)
      return { error }
    }
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
