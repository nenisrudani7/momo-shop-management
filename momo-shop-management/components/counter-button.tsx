"use client"

import { Button } from "@/components/ui/button"
import { MinusIcon, PlusIcon } from "lucide-react"

interface CounterButtonProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  size?: "sm" | "default"
}

export function CounterButton({ value, onIncrement, onDecrement, size = "default" }: CounterButtonProps) {
  const buttonSize = size === "sm" ? "h-7 w-7" : "h-9 w-9"
  const valueSize = size === "sm" ? "text-sm w-8" : "w-10"

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full ${buttonSize}`}
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <div className={`${valueSize} text-center font-medium`}>{value}</div>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full ${buttonSize}`}
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

