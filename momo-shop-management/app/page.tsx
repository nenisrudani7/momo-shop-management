"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DateSelector } from "@/components/date-selector"
import { DishRow } from "@/components/dish-row"
import { AddDishForm } from "@/components/add-dish-form"
import { ShopProvider, useShop } from "@/context/shop-context"
import { useRouter } from "next/navigation"
import { SaveIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function HomePage() {
  const router = useRouter()
  const { dishes, categories, currentDate, setCurrentDate, quantitySold, updateQuantity, saveDailySales, isLoading } =
    useShop()

  // Group dishes by category
  const dishesByCategory = dishes.reduce(
    (acc, dish) => {
      const categoryName = dish.category_name || "Uncategorized"
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(dish)
      return acc
    },
    {} as Record<string, typeof dishes>,
  )

  // Calculate total sales
  const totalSales = dishes.reduce((total, dish) => {
    const quantity = quantitySold[dish.id] || 0
    return total + dish.price * quantity
  }, 0)

  const handleSaveAndEnd = async () => {
    await saveDailySales()
    router.push(`/end-of-day?date=${currentDate}`)
  }

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader className="hidden md:block">
            <div className="grid grid-cols-5 font-semibold">
              <div className="col-span-2">Dish</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Total</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {[1, 2, 3].map((category) => (
              <div key={category} className="mb-4">
                <div className="bg-muted px-4 py-2">
                  <Skeleton className="h-6 w-24" />
                </div>
                {[1, 2, 3].map((dish) => (
                  <div key={dish} className="p-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Daily Sales Tracker</h1>
        <DateSelector date={currentDate} onDateChange={setCurrentDate} />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <AddDishForm />
      </div>

      <Card>
        <CardHeader className="hidden md:block">
          <div className="grid grid-cols-5 font-semibold">
            <div className="col-span-2">Dish</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-right">Total</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {Object.keys(dishesByCategory).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No dishes added yet. Add your first dish to get started!</p>
              <AddDishForm />
            </div>
          ) : (
            Object.entries(dishesByCategory).map(([category, categoryDishes]) => (
              <div key={category} className="mb-4">
                <div className="bg-muted px-4 py-2 font-medium">{category}</div>
                {categoryDishes.map((dish) => (
                  <DishRow
                    key={dish.id}
                    dish={dish}
                    quantity={quantitySold[dish.id] || 0}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            ))
          )}

          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-lg font-bold">Total Sales</div>
            <div className="text-xl font-bold">₹{totalSales}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveAndEnd} className="gap-2" disabled={totalSales === 0}>
          <SaveIcon className="h-4 w-4" /> Save & End Day
        </Button>
      </div>
    </div>
  )
}

export default function HomePageWrapper() {
  return (
    <ShopProvider>
      <HomePage />
    </ShopProvider>
  )
}

