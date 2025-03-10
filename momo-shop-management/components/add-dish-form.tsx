"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusIcon } from "lucide-react"
import { useShop } from "@/context/shop-context"

export function AddDishForm() {
  const { categories, addCategory, addDish } = useShop()
  const [open, setOpen] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newDish, setNewDish] = useState({
    name: "",
    category_id: "",
    price: "",
  })
  const [newCategory, setNewCategory] = useState("")

  const handleAddDish = async () => {
    if (newDish.name && newDish.category_id && newDish.price) {
      await addDish({
        name: newDish.name,
        category_id: Number.parseInt(newDish.category_id),
        price: Number(newDish.price),
      })
      setNewDish({ name: "", category_id: "", price: "" })
      setOpen(false)
    }
  }

  const handleAddCategory = async () => {
    if (newCategory) {
      const categoryId = await addCategory(newCategory)
      if (categoryId) {
        setNewDish({ ...newDish, category_id: categoryId.toString() })
        setNewCategory("")
        setShowNewCategory(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" /> Add New Dish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Dish</DialogTitle>
          <DialogDescription>Add a new momo dish to your menu. Fill in all the details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newDish.name}
              onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
              className="col-span-3"
              placeholder="Dish name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            {showNewCategory ? (
              <div className="col-span-3 flex gap-2">
                <Input
                  id="new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                  placeholder="New category name"
                />
                <Button size="sm" onClick={handleAddCategory}>
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewCategory(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="col-span-3 flex gap-2">
                <Select
                  value={newDish.category_id}
                  onValueChange={(value) => setNewDish({ ...newDish, category_id: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => setShowNewCategory(true)}>
                  New
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              value={newDish.price}
              onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
              className="col-span-3"
              placeholder="Price"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddDish}>
            Add Dish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

