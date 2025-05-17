import { getSupabase, createServerSupabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Challenge = Database["public"]["Tables"]["challenges"]["Row"]
export type UserChallenge = Database["public"]["Tables"]["user_challenges"]["Row"]

// Client-side challenge service
export const challengeService = {
  async getAll() {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("challenges").select("*")

    if (error) {
      console.error("Error fetching challenges:", error)
      throw error
    }

    return data
  },

  async getById(id: number) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("challenges").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching challenge with id ${id}:`, error)
      throw error
    }

    return data
  },

  async getBySlug(slug: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("challenges").select("*").eq("slug", slug).single()

    if (error) {
      console.error(`Error fetching challenge with slug ${slug}:`, error)
      throw error
    }

    return data
  },

  async getFeatured() {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("challenges").select("*").eq("is_featured", true)

    if (error) {
      console.error("Error fetching featured challenges:", error)
      throw error
    }

    return data
  },

  async getUserChallenges(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("user_challenges")
      .select("*, challenges(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user challenges:", error)
      throw error
    }

    return data
  },

  async getUserChallengeById(id: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("user_challenges").select("*, challenges(*)").eq("id", id).single()

    if (error) {
      console.error(`Error fetching user challenge with id ${id}:`, error)
      throw error
    }

    return data
  },

  async joinChallenge(userId: string, challengeId: number) {
    const supabase = getSupabase()
    const { data, error } = await supabase.rpc("join_challenge", {
      p_user_id: userId,
      p_challenge_id: challengeId,
    })

    if (error) {
      console.error(`Error joining challenge ${challengeId}:`, error)
      throw error
    }

    return data
  },

  async checkIn(userChallengeId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.rpc("challenge_check_in", {
      p_challenge_id: userChallengeId,
    })

    if (error) {
      console.error(`Error checking in for challenge ${userChallengeId}:`, error)
      throw error
    }

    return data
  },
}

// Server-side challenge service
export const serverChallengeService = {
  async getAll() {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("challenges").select("*")

    if (error) {
      console.error("Error fetching challenges:", error)
      throw error
    }

    return data
  },

  async getById(id: number) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("challenges").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching challenge with id ${id}:`, error)
      throw error
    }

    return data
  },

  async getBySlug(slug: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("challenges").select("*").eq("slug", slug).single()

    if (error) {
      console.error(`Error fetching challenge with slug ${slug}:`, error)
      throw error
    }

    return data
  },

  async getFeatured() {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("challenges").select("*").eq("is_featured", true)

    if (error) {
      console.error("Error fetching featured challenges:", error)
      throw error
    }

    return data
  },

  async getUserChallenges(userId: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from("user_challenges")
      .select("*, challenges(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user challenges:", error)
      throw error
    }

    return data
  },

  async getUserChallengeById(id: string) {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("user_challenges").select("*, challenges(*)").eq("id", id).single()

    if (error) {
      console.error(`Error fetching user challenge with id ${id}:`, error)
      throw error
    }

    return data
  },
}
