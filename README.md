
# Momo Shop Management System

## 🚀 Overview
The **Momo Shop Management System** is a simple web application designed for shop owners to track daily momo sales, update dish quantities in real-time, and view total earnings. The system is built using **React (Vite) + TailwindCSS**, uses **Supabase** as the cloud database, and is deployed on **Vercel**.

## 🛠️ Tech Stack
- **Frontend:** React.js (Vite) + TailwindCSS
- **Backend (Database):** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Version Control:** GitHub (for automatic deployments)

## ✨ Features
- 📊 **Real-time Dish Counter**: Add or remove dish counts using `+` and `-` buttons.
- 💰 **Automatic Sales Calculation**: Updates total earnings dynamically.
- 📅 **Daily Sales Summary**: View total quantity sold & earnings at the end of the day.
- 🗂 **Sales History**: Track previous sales data.
- ☁️ **Cloud Database (Supabase)**: Stores sales records securely.
- 🚀 **GitHub Integration**: Automatic deployment with Vercel.

## 📌 Installation & Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/your-username/momo-shop-management.git
cd momo-shop-management
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file in the root directory and add the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **4️⃣ Run the Project Locally**
```bash
npm run dev
```

### **5️⃣ Deploy to Vercel**
1. Push your code to GitHub.
2. Connect your repository to [Vercel](https://vercel.com/).
3. Deploy the project.

## 📸 UI Preview (Example Layout)
```
----------------------------------------------------
| Date: [Today’s Date]                             |
----------------------------------------------------
| Dish Name  | Category  | Price  | Qty | Total ₹  |
----------------------------------------------------
| Paneer Momo| Steamed   | ₹80    |  3  | ₹240    | [+] [-]
| Chicken Momo| Steamed  | ₹100   |  5  | ₹500    | [+] [-]
| Veg Fried Momo | Fried | ₹90    |  2  | ₹180    | [+] [-]
----------------------------------------------------
| TOTAL SALES: ₹920                                |
----------------------------------------------------
| [ SAVE & END DAY ] (Button)                      |
----------------------------------------------------
```

## 📌 Next Steps
- ✅ Build the UI Components
- ✅ Implement State Management for Dish Counters
- ✅ Connect Frontend to Supabase
- ✅ Deploy on Vercel

## 📜 License
This project is **open-source** and free to use.

