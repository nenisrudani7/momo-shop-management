"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShopProvider, useShop } from "@/context/shop-context"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowRightIcon, CalendarIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

function SalesHistoryPage() {
  const { isLoading } = useShop()
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [sales, setSales] = useState<any[]>([])
  const [loadingSales, setLoadingSales] = useState(true)

  useEffect(() => {
    async function fetchSales() {
      setLoadingSales(true)

      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: sortOrder === "asc" })

      if (error) {
        console.error("Error fetching sales:", error)
      } else {
        setSales(data || [])
      }

      setLoadingSales(false)
    }

    if (!isLoading) {
      fetchSales()
    }
  }, [sortOrder, isLoading])

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  if (isLoading || loadingSales) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
        <Button variant="outline" onClick={toggleSortOrder}>
          Sort {sortOrder === "desc" ? "Oldest First" : "Newest First"}
        </Button>
      </div>

      {sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Sales Records</h2>
            <p className="text-muted-foreground text-center mb-4">
              You haven't recorded any sales yet. Start by adding sales on the home page.
            </p>
            <Button asChild>
              <Link href="/">Go to Daily Sales</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sales.map((sale) => (
            <Card key={sale.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{format(new Date(sale.date), "PPP")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Sales</p>
                  </div>
                  <div className="text-xl font-bold">₹{sale.total_amount}</div>
                </div>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link href={`/end-of-day?date=${sale.date}`} className="flex items-center justify-center gap-2">
                    View Details <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SalesHistoryPageWrapper() {
  return (
    <ShopProvider>
      <SalesHistoryPage />
    </ShopProvider>
  )
}

