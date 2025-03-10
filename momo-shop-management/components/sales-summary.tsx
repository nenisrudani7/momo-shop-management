"use client"

import { useShop } from "@/context/shop-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useEffect, useState } from "react"

interface SalesSummaryProps {
  date: string
}

export function SalesSummary({ date }: SalesSummaryProps) {
  const { dishes, fetchSalesByDate } = useShop()
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSale() {
      setLoading(true)
      const saleData = await fetchSalesByDate(date)
      setSale(saleData)
      setLoading(false)
    }

    loadSale()
  }, [date, fetchSalesByDate])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading sales data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Sales Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No sales data available for {format(new Date(date), "PPP")}</p>
        </CardContent>
      </Card>
    )
  }

  // Group dishes by category
  const salesByCategory: Record<
    string,
    { total: number; items: { name: string; quantity: number; amount: number }[] }
  > = {}

  sale.dishes.forEach((item: any) => {
    const dish = dishes.find((d) => d.id === item.dishId)
    if (dish) {
      const categoryName = dish.category_name || "Uncategorized"

      if (!salesByCategory[categoryName]) {
        salesByCategory[categoryName] = { total: 0, items: [] }
      }
      const amount = item.price * item.quantity
      salesByCategory[categoryName].total += amount
      salesByCategory[categoryName].items.push({
        name: dish.name,
        quantity: item.quantity,
        amount,
      })
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Sales Summary - {format(new Date(date), "PPP")}</span>
          <Badge variant="outline" className="text-lg">
            ₹{sale.totalSales}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(salesByCategory).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{category}</h3>
                <Badge>₹{data.total}</Badge>
              </div>
              <div className="pl-4 space-y-1">
                {data.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

