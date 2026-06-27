# Arbeit Mart E-Commerce Platform

This is a complete, single-vendor full-stack e-commerce application designed and implemented for the technical hiring assignment.

## Stack & Architecture
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, GSAP (animations)
- **Backend**: Node.js, Express, MongoDB (Mongoose ORM)

## Features Included
1. **Public Storefront**:
   - Interactive hero banner with GSAP animations.
   - Search bar with live filtering.
   - Filter by Category, Price Range, and In-Stock status.
   - Dynamic product detail page with option selectors (Color, Size, etc.) and auto-matched price, SKU, stock level, and image changes.
2. **Cart & Checkout**:
   - Slide-out Cart Drawer with real-time subtotal calculations, quantities adjustments, and deletion.
   - Checkout form capturing customer details, postal codes, and shipping address.
   - Automated server-side checkout calculations (shipping fees based on zone, discount calculations from Coupon codes).
   - Stock deduction upon order submission.
3. **Admin Dashboard**:
   - Real-time Sales Overview, total orders, low stock count, and active products count.
   - Sales trends area chart and Order Funnel bar chart.
   - **Variable Product Manager**: Create variable products with customized options attributes, auto-generate variant combinations, upload variant images, assign prices/inventory stock levels, and add variants manually.
   - **Coupons Management**: Generate promotional discount codes and toggle active/inactive status.
   - **Shipping Management**: Add/delete shipping zones, regions, and delivery costs.
   - **Order Control Panel**: Update orders statuses (Pending -> Confirmed -> Shipped -> Delivered) and review shipping address/transaction logs.

## Setup & Running Locally

### 1. Run the Backend
Navigate to the backend directory `arbeit-mart-backend` and start the server:
```bash
cd arbeit-mart-backend
npm install
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 2. Run the Frontend
Navigate to the frontend directory `arbeit-mart-frontend` and start the development server:
```bash
cd arbeit-mart-frontend
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.
