export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          id: number
          name: string
          category_id: number
          price: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          category_id: number
          price: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          category_id?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          id: number
          date: string
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: number
          date: string
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: number
          date?: string
          total_amount?: number
          created_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: number
          sale_id: number
          dish_id: number
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: number
          sale_id: number
          dish_id: number
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: number
          sale_id?: number
          dish_id?: number
          quantity?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_dish_id_fkey"
            columns: ["dish_id"]
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

