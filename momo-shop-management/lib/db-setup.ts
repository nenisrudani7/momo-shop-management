import { supabase } from "./supabase"

export async function setupDatabase() {
  // Check if categories table exists and has data
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").limit(1)

  if (categoriesError || !categories || categories.length === 0) {
    console.log("Setting up initial database...")

    // Create default categories
    const defaultCategories = [
      { name: "Steamed" },
      { name: "Fried" },
      { name: "Tandoori" },
      { name: "Soup" },
      { name: "Special" },
    ]

    const { data: insertedCategories, error: insertCategoriesError } = await supabase
      .from("categories")
      .insert(defaultCategories)
      .select()

    if (insertCategoriesError) {
      console.error("Error creating default categories:", insertCategoriesError)
      return
    }

    // Create default dishes if categories were created successfully
    if (insertedCategories) {
      const categoryMap = insertedCategories.reduce(
        (acc, category) => {
          acc[category.name] = category.id
          return acc
        },
        {} as Record<string, number>,
      )

      const defaultDishes = [
        { name: "Classic Veg Momo", category_id: categoryMap["Steamed"], price: 120 },
        { name: "Chicken Momo", category_id: categoryMap["Steamed"], price: 150 },
        { name: "Paneer Momo", category_id: categoryMap["Steamed"], price: 140 },
        { name: "Crispy Veg Momo", category_id: categoryMap["Fried"], price: 140 },
        { name: "Crispy Chicken Momo", category_id: categoryMap["Fried"], price: 170 },
        { name: "Tandoori Veg Momo", category_id: categoryMap["Tandoori"], price: 160 },
        { name: "Tandoori Chicken Momo", category_id: categoryMap["Tandoori"], price: 190 },
        { name: "Momo Soup", category_id: categoryMap["Soup"], price: 200 },
      ]

      const { error: insertDishesError } = await supabase.from("dishes").insert(defaultDishes)

      if (insertDishesError) {
        console.error("Error creating default dishes:", insertDishesError)
      }
    }
  }
}

