"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SalesSummary } from "@/components/sales-summary"
import { ShopProvider, useShop } from "@/context/shop-context"
import { ArrowLeftIcon, HistoryIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function EndOfDayPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoading } = useShop()
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">End of Day Summary</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Home
          </Button>
          <Button onClick={() => router.push("/sales-history")} className="gap-2">
            <HistoryIcon className="h-4 w-4" /> View Sales History
          </Button>
        </div>
      </div>

      <SalesSummary date={date} />
    </div>
  )
}

export default function EndOfDayPageWrapper() {
  return (
    <ShopProvider>
      <EndOfDayPage />
    </ShopProvider>
  )
}

