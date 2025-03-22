import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Download, Minus, Plus, PlusCircle, X, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import Button from './ui/Button';
import type { Category, Dish, DailySale } from '../types';

export default function Dashboard() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDish, setShowAddDish] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newDish, setNewDish] = useState({ name: '', price: '', category_id: '' });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, [date]);

  async function fetchData() {
    try {
      setLoading(true);
      
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      const { data: dishesData } = await supabase
        .from('dishes')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name');
      
      const { data: salesData } = await supabase
        .from('daily_sales')
        .select(`
          *,
          dish:dishes(*)
        `)
        .eq('sale_date', date);

      if (categoriesData) setCategories(categoriesData);
      if (dishesData) setDishes(dishesData);
      if (salesData) setDailySales(salesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategory });

      if (error) throw error;

      setNewCategory('');
      setShowAddCategory(false);
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  async function addDish(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('dishes')
        .insert({
          name: newDish.name,
          category_id: newDish.category_id,
          price: parseInt(newDish.price)
        });

      if (error) throw error;

      setNewDish({ name: '', price: '', category_id: '' });
      setShowAddDish(false);
      fetchData();
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  }

  async function updateQuantity(dish: Dish, increment: boolean) {
    const existingSale = dailySales.find(sale => sale.dish_id === dish.id);
    const newQuantity = (existingSale?.quantity || 0) + (increment ? 1 : -1);
    
    if (newQuantity < 0) return;

    const totalAmount = newQuantity * dish.price;

    if (existingSale) {
      const { error } = await supabase
        .from('daily_sales')
        .update({
          quantity: newQuantity,
          total_amount: totalAmount
        })
        .eq('id', existingSale.id);

      if (error) {
        console.error('Error updating sale:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('daily_sales')
        .insert({
          dish_id: dish.id,
          quantity: newQuantity,
          total_amount: totalAmount,
          sale_date: date
        });

      if (error) {
        console.error('Error creating sale:', error);
        return;
      }
    }

    fetchData();
  }

  function generatePDF() {
    const doc = new jsPDF();
    const totalSales = dailySales.reduce((sum, sale) => sum + sale.total_amount, 0);

    doc.setFontSize(20);
    doc.text('Daily Sales Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(date), 'MMMM d, yyyy')}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Dish Name', 'Category', 'Price', 'Quantity', 'Total']],
      body: dishes.map(dish => {
        const sale = dailySales.find(s => s.dish_id === dish.id);
        return [
          dish.name,
          dish.category?.name,
          `₹${dish.price}`,
          sale?.quantity || 0,
          `₹${sale?.total_amount || 0}`
        ];
      }),
      foot: [['', '', '', 'Grand Total:', `₹${totalSales}`]],
    });

    doc.save(`sales-report-${date}.pdf`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalSales = dailySales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="min-h-screen bg-background py-4 px-2 sm:py-8 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Daily Sales Tracker</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track and manage your daily momo sales
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
            />
            <Button
              onClick={() => setShowAddCategory(true)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Categories
            </Button>
            <Button
              onClick={() => setShowAddDish(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Dish
            </Button>
            <Button
              onClick={generatePDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {showAddCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Manage Categories</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCategory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={addCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    New Category Name
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
                    />
                    <Button type="submit">Add</Button>
                  </div>
                </div>
              </form>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Existing Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-foreground">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddDish && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Add New Dish</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDish(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={addDish} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Dish Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <select
                    required
                    value={newDish.category_id}
                    onChange={(e) => setNewDish({ ...newDish, category_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDish(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Dish
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-card shadow rounded-lg overflow-x-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dish Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {dishes.map((dish) => {
                  const sale = dailySales.find(s => s.dish_id === dish.id);
                  return (
                    <tr key={dish.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {dish.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {dish.category?.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        ₹{dish.price}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {sale?.quantity || 0}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        ₹{sale?.total_amount || 0}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(dish, false)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(dish, true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted">
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    Total Sales
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    ₹{totalSales}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}