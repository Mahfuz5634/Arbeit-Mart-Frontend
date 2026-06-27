import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AlertTriangle, TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch('http://localhost:5000/api/product');
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);

        const ordRes = await fetch('http://localhost:5000/api/order');
        const ordData = await ordRes.json();
        setOrders(Array.isArray(ordData) ? ordData : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const lowStockItems = [];
  products.forEach(product => {
    if (product && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        if (variant && variant.stock < 5) {
          lowStockItems.push({
            productId: product._id,
            productName: product.name,
            sku: variant.sku,
            attributes: Object.entries(variant.attributes || variant.attributeValues || {})
              .map(([k, v]) => `${k}: ${v}`)
              .join(', '),
            stock: variant.stock
          });
        }
      });
    }
  });

  const totalSales = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalOrders = orders.length;
  const lowStockCount = lowStockItems.length;

  const salesData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 600 },
    { name: 'Thu', sales: 800 },
    { name: 'Fri', sales: 500 },
    { name: 'Sat', sales: 900 },
    { name: 'Sun', sales: totalSales || 700 }
  ];

  const funnelData = [
    { name: 'Visitors', count: 1200, fill: '#6366f1' },
    { name: 'Add to Cart', count: 450, fill: '#818cf8' },
    { name: 'Checkout', count: 180, fill: '#a5b4fc' },
    { name: 'Purchased', count: totalOrders || 90, fill: '#c7d2fe' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time store performance indicators.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Sales</p>
            <h3 className="text-2xl font-bold text-white">৳ {totalSales.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-bold text-white">{totalOrders}</h3>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-amber-400">{lowStockCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Products</p>
            <h3 className="text-2xl font-bold text-emerald-400">{products.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Sales Overview</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Order Funnel</h2>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Low Stock Alerts
        </h2>
        <div className="overflow-x-auto">
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">All products are well stocked.</p>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Attributes</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lowStockItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{item.productName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.sku}</td>
                    <td className="py-3 px-4 text-slate-400">{item.attributes || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400">
                        {item.stock} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
