import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router";
import ProductDetail from "./pages/ProductDetail.jsx";
import Login from "./pages/Login.jsx";

import AdminLayout from "./components/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminCoupons from "./pages/admin/Coupons.jsx";
import AdminShipping from "./pages/admin/Shipping.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/product/:id",
    element: <ProductDetail />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "coupons",
        element: <AdminCoupons />,
      },
      {
        path: "shipping",
        element: <AdminShipping />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router} />,
  </StrictMode>,
)
