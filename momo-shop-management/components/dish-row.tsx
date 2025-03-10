"use client"

import type { Dish } from "@/context/shop-context"
import { CounterButton } from "./counter-button"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-mobile"

interface DishRowProps {
  dish: Dish
  quantity: number
  onUpdateQuantity: (dishId: number, change: number) => void
}

export function DishRow({ dish, quantity, onUpdateQuantity }: DishRowProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const totalPrice = dish.price * quantity

  if (isMobile) {
    return (
      <div className="flex flex-col p-4 border-b">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{dish.name}</h3>
            <Badge variant="outline" className="mt-1">
              {dish.category_name}
            </Badge>
          </div>
          <div className="text-right">
            <p className="font-medium">₹{dish.price}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <CounterButton
            value={quantity}
            onIncrement={() => onUpdateQuantity(dish.id, 1)}
            onDecrement={() => onUpdateQuantity(dish.id, -1)}
          />
          <div className="font-semibold">₹{totalPrice}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 items-center py-3 border-b">
      <div className="col-span-2">
        <h3 className="font-medium">{dish.name}</h3>
        <Badge variant="outline" className="mt-1">
          {dish.category_name}
        </Badge>
      </div>
      <div className="text-center">₹{dish.price}</div>
      <div className="flex justify-center">
        <CounterButton
          value={quantity}
          onIncrement={() => onUpdateQuantity(dish.id, 1)}
          onDecrement={() => onUpdateQuantity(dish.id, -1)}
        />
      </div>
      <div className="text-right font-semibold">₹{totalPrice}</div>
    </div>
  )
}

