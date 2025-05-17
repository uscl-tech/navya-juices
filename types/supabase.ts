export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          stock: number
          is_featured: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          stock?: number
          is_featured?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          category?: string
          stock?: number
          is_featured?: boolean
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: number
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: number
          quantity: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: number
          quantity?: number
        }
      }
      addresses: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          is_default: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          is_default?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          is_default?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          status: string
          payment_method: string
          subtotal: number
          shipping_fee: number
          total: number
          shipping_address: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          status?: string
          payment_method: string
          subtotal: number
          shipping_fee: number
          total: number
          shipping_address: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          status?: string
          payment_method?: string
          subtotal?: number
          shipping_fee?: number
          total?: number
          shipping_address?: Json
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: number
          product_name: string
          product_price: number
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: number
          product_name: string
          product_price: number
          quantity: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: number
          product_name?: string
          product_price?: number
          quantity?: number
        }
      }
      challenges: {
        Row: {
          id: number
          created_at: string
          title: string
          slug: string
          description: string
          duration: number
          product_id: number
          image_url: string
          is_featured: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          slug: string
          description: string
          duration: number
          product_id: number
          image_url: string
          is_featured?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          slug?: string
          description?: string
          duration?: number
          product_id?: number
          image_url?: string
          is_featured?: boolean
        }
      }
      user_challenges: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          challenge_id: number
          start_date: string
          current_day: number
          completed_days: number[]
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          challenge_id: number
          start_date?: string
          current_day?: number
          completed_days?: number[]
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          challenge_id?: number
          start_date?: string
          current_day?: number
          completed_days?: number[]
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      join_challenge: {
        Args: {
          p_user_id: string
          p_challenge_id: number
        }
        Returns: string
      }
      challenge_check_in: {
        Args: {
          p_challenge_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
