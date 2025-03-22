export interface User {
  id: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Dish {
  id: string;
  name: string;
  category_id: string;
  price: number;
  created_at: string;
  category?: Category;
}

export interface DailySale {
  id: string;
  dish_id: string;
  quantity: number;
  total_amount: number;
  sale_date: string;
  created_at: string;
  dish?: Dish;
}