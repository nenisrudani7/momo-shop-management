"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { setupDatabase } from "@/lib/db-setup"
import { toast } from "@/hooks/use-toast"

export type MomoCategory = string

export interface Category {
  id: number
  name: string
}

export interface Dish {
  id: number
  name: string
  category_id: number
  category_name?: string
  price: number
}

export interface DailySale {
  id?: number
  date: string
  dishes: {
    dishId: number
    quantity: number
    price: number
  }[]
  totalSales: number
}

interface ShopContextType {
  dishes: Dish[]
  categories: Category[]
  isLoading: boolean
  addDish: (dish: Omit<Dish, "id">) => Promise<void>
  removeDish: (id: number) => Promise<void>
  dailySales: Record<string, DailySale>
  currentDate: string
  setCurrentDate: (date: string) => void
  quantitySold: Record<number, number>
  updateQuantity: (dishId: number, quantity: number) => void
  resetQuantities: () => void
  saveDailySales: () => Promise<void>
  addCategory: (categoryName: string) => Promise<number | undefined>
  fetchSalesByDate: (date: string) => Promise<DailySale | null>
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dailySales, setDailySales] = useState<Record<string, DailySale>>({})
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [quantitySold, setQuantitySold] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Initialize database and load data
  useEffect(() => {
    async function initializeData() {
      try {
        setIsLoading(true)

        // Setup database with initial data if needed
        await setupDatabase()

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name")

        if (categoriesError) throw categoriesError

        // Fetch dishes with category names
        const { data: dishesData, error: dishesError } = await supabase
          .from("dishes")
          .select(`
            *,
            categories(name)
          `)
          .order("name")

        if (dishesError) throw dishesError

        // Transform dishes data to include category_name
        const formattedDishes = dishesData.map((dish) => ({
          ...dish,
          category_name: dish.categories?.name,
        }))

        setCategories(categoriesData || [])
        setDishes(formattedDishes || [])

        // Load sales for current date
        await fetchSalesByDate(currentDate)
      } catch (error) {
        console.error("Error initializing data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading your shop data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // Reset quantities when date changes and load sales for that date
  useEffect(() => {
    resetQuantities()
    fetchSalesByDate(currentDate)
  }, [currentDate])

  const fetchSalesByDate = async (date: string): Promise<DailySale | null> => {
    try {
      // Find sale for the given date
      const { data: salesData, error: salesError } = await supabase.from("sales").select("*").eq("date", date).single()

      if (salesError && salesError.code !== "PGRST116") {
        throw salesError
      }

      if (!salesData) {
        return null
      }

      // Get sale items for this sale
      const { data: saleItemsData, error: saleItemsError } = await supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", salesData.id)

      if (saleItemsError) throw saleItemsError

      // Format the sale data
      const sale: DailySale = {
        id: salesData.id,
        date: salesData.date,
        dishes:
          saleItemsData?.map((item) => ({
            dishId: item.dish_id,
            quantity: item.quantity,
            price: item.price,
          })) || [],
        totalSales: salesData.total_amount,
      }

      // Update quantities for the current date
      const quantities: Record<number, number> = {}
      sale.dishes.forEach((item) => {
        quantities[item.dishId] = item.quantity
      })
      setQuantitySold(quantities)

      // Update dailySales state
      setDailySales((prev) => ({
        ...prev,
        [date]: sale,
      }))

      return sale
    } catch (error) {
      console.error("Error fetching sales by date:", error)
      return null
    }
  }

  const addDish = async (dish: Omit<Dish, "id">) => {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .insert({
          name: dish.name,
          category_id: dish.category_id,
          price: dish.price,
        })
        .select(`
          *,
          categories(name)
        `)
        .single()

      if (error) throw error

      const newDish = {
        ...data,
        category_name: data.categories?.name,
      }

      setDishes((prev) => [...prev, newDish])

      toast({
        title: "Dish added",
        description: `${dish.name} has been added to your menu.`,
      })
    } catch (error) {
      console.error("Error adding dish:", error)
      toast({
        title: "Error adding dish",
        description: "There was a problem adding the dish.",
        variant: "destructive",
      })
    }
  }

  const removeDish = async (id: number) => {
    try {
      const { error } = await supabase.from("dishes").delete().eq("id", id)

      if (error) throw error

      setDishes((prev) => prev.filter((dish) => dish.id !== id))

      toast({
        title: "Dish removed",
        description: "The dish has been removed from your menu.",
      })
    } catch (error) {
      console.error("Error removing dish:", error)
      toast({
        title: "Error removing dish",
        description: "There was a problem removing the dish.",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = (dishId: number, quantity: number) => {
    setQuantitySold((prev) => ({
      ...prev,
      [dishId]: Math.max(0, (prev[dishId] || 0) + quantity),
    }))
  }

  const resetQuantities = () => {
    setQuantitySold({})
  }

  const saveDailySales = async () => {
    try {
      const dishSales = Object.entries(quantitySold)
        .filter(([_, quantity]) => quantity > 0)
        .map(([dishId, quantity]) => {
          const dish = dishes.find((d) => d.id === Number.parseInt(dishId))
          return {
            dishId: Number.parseInt(dishId),
            quantity,
            price: dish?.price || 0,
          }
        })

      const totalSales = dishSales.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)

      // Check if we already have a sale for this date
      const existingSale = await fetchSalesByDate(currentDate)

      if (existingSale?.id) {
        // Update existing sale
        const { error: updateSaleError } = await supabase
          .from("sales")
          .update({ total_amount: totalSales })
          .eq("id", existingSale.id)

        if (updateSaleError) throw updateSaleError

        // Delete existing sale items
        const { error: deleteSaleItemsError } = await supabase
          .from("sale_items")
          .delete()
          .eq("sale_id", existingSale.id)

        if (deleteSaleItemsError) throw deleteSaleItemsError

        // Insert new sale items
        if (dishSales.length > 0) {
          const saleItems = dishSales.map((item) => ({
            sale_id: existingSale.id!,
            dish_id: item.dishId,
            quantity: item.quantity,
            price: item.price,
          }))

          const { error: insertSaleItemsError } = await supabase.from("sale_items").insert(saleItems)

          if (insertSaleItemsError) throw insertSaleItemsError
        }
      } else {
        // Create new sale
        const { data: saleData, error: createSaleError } = await supabase
          .from("sales")
          .insert({
            date: currentDate,
            total_amount: totalSales,
          })
          .select()
          .single()

        if (createSaleError) throw createSaleError

        // Insert sale items
        if (dishSales.length > 0 && saleData) {
          const saleItems = dishSales.map((item) => ({
            sale_id: saleData.id,
            dish_id: item.dishId,
            quantity: item.quantity,
            price: item.price,
          }))

          const { error: insertSaleItemsError } = await supabase.from("sale_items").insert(saleItems)

          if (insertSaleItemsError) throw insertSaleItemsError
        }
      }

      // Update local state
      setDailySales((prev) => ({
        ...prev,
        [currentDate]: {
          date: currentDate,
          dishes: dishSales,
          totalSales,
        },
      }))

      resetQuantities()

      toast({
        title: "Sales saved",
        description: `Sales for ${currentDate} have been saved.`,
      })
    } catch (error) {
      console.error("Error saving sales:", error)
      toast({
        title: "Error saving sales",
        description: "There was a problem saving your sales data.",
        variant: "destructive",
      })
    }
  }

  const addCategory = async (categoryName: string): Promise<number | undefined> => {
    try {
      // Check if category already exists
      const existingCategory = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())

      if (existingCategory) {
        return existingCategory.id
      }

      // Add new category
      const { data, error } = await supabase.from("categories").insert({ name: categoryName }).select().single()

      if (error) throw error

      const newCategory = {
        id: data.id,
        name: data.name,
      }

      setCategories((prev) => [...prev, newCategory])

      toast({
        title: "Category added",
        description: `${categoryName} has been added as a new category.`,
      })

      return data.id
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error adding category",
        description: "There was a problem adding the category.",
        variant: "destructive",
      })
      return undefined
    }
  }

  return (
    <ShopContext.Provider
      value={{
        dishes,
        categories,
        isLoading,
        addDish,
        removeDish,
        dailySales,
        currentDate,
        setCurrentDate,
        quantitySold,
        updateQuantity,
        resetQuantities,
        saveDailySales,
        addCategory,
        fetchSalesByDate,
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider")
  }
  return context
}

