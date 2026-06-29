import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Calendar 
} from 'lucide-react';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        
        const prodRes = await fetch(`${apiBase}/api/product`);
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);

        const ordRes = await fetch(`${apiBase}/api/order`);
        const ordData = await ordRes.json();
        setOrders(Array.isArray(ordData) ? ordData : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute low-stock variants with restock priority ranks
  const getLowStockItems = () => {
    const items = [];
    products.forEach(product => {
      if (product && Array.isArray(product.variants)) {
        product.variants.forEach(variant => {
          if (variant && variant.stock < 5) {
            let priority = 'Medium';
            let priorityClass = 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
            if (variant.stock === 0) {
              priority = 'Critical';
              priorityClass = 'text-red-400 bg-red-500/10 border border-red-500/20';
            } else if (variant.stock <= 2) {
              priority = 'High';
              priorityClass = 'text-orange-400 bg-orange-500/10 border border-orange-500/20';
            }
            
            items.push({
              productId: product._id,
              productName: product.name,
              sku: variant.sku,
              attributes: Object.entries(variant.attributes || variant.attributeValues || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join(', '),
              stock: variant.stock,
              priority,
              priorityClass
            });
          }
        });
      }
    });
    return items;
  };

  const lowStockItems = getLowStockItems();

  // Sales calculations with trends
  const getSalesStats = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
    
    let todaySales = 0;
    let yesterdaySales = 0;
    let thisMonthSales = 0;
    let lastMonthSales = 0;
    let thisYearSales = 0;
    let lastYearSales = 0;
    
    orders.forEach(o => {
      if (o.orderStatus === 'Cancelled') return;
      const orderDate = new Date(o.createdAt);
      const amount = o.totalAmount || 0;
      
      // Today
      if (orderDate >= today) {
        todaySales += amount;
      }
      // Yesterday
      else if (orderDate >= yesterday && orderDate < today) {
        yesterdaySales += amount;
      }
      
      // This Month
      if (orderDate >= thisMonthStart) {
        thisMonthSales += amount;
      }
      // Last Month
      else if (orderDate >= lastMonthStart && orderDate <= lastMonthEnd) {
        lastMonthSales += amount;
      }
      
      // This Year
      if (orderDate >= thisYearStart) {
        thisYearSales += amount;
      }
      // Last Year
      else if (orderDate >= lastYearStart && orderDate <= lastYearEnd) {
        lastYearSales += amount;
      }
    });
    
    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };
    
    return {
      todaySales,
      todayTrend: calculateTrend(todaySales, yesterdaySales),
      thisMonthSales,
      thisMonthTrend: calculateTrend(thisMonthSales, lastMonthSales),
      thisYearSales,
      thisYearTrend: calculateTrend(thisYearSales, lastYearSales)
    };
  };

  const stats = getSalesStats();

  // Dynamic 7-day sales overview
  const getWeeklySalesData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const key = `${dayLabel} (${dateStr})`;
      dataMap[key] = { name: key, sales: 0, dateObj: new Date(d.setHours(0,0,0,0)) };
    }
    
    orders.forEach(o => {
      if (o.orderStatus === 'Cancelled') return;
      const orderDate = new Date(o.createdAt);
      orderDate.setHours(0,0,0,0);
      
      Object.keys(dataMap).forEach(key => {
        if (orderDate.getTime() === dataMap[key].dateObj.getTime()) {
          dataMap[key].sales += o.totalAmount || 0;
        }
      });
    });
    
    return Object.values(dataMap).map(({ name, sales }) => ({ name, sales }));
  };

  const salesChartData = getWeeklySalesData();

  // Order Funnel Counts
  const funnelStages = [
    { name: 'Pending', count: orders.filter(o => o.orderStatus === 'Pending').length, desc: 'Awaiting confirmation' },
    { name: 'Confirmed', count: orders.filter(o => o.orderStatus === 'Confirmed').length, desc: 'Verified & processing' },
    { name: 'Shipped', count: orders.filter(o => o.orderStatus === 'Shipped').length, desc: 'In transit with courier' },
    { name: 'Delivered', count: orders.filter(o => o.orderStatus === 'Delivered').length, desc: 'Successfully completed' }
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time store performance and transaction indicators.</p>
      </div>

      {/* Sales Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today's Sales */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white">৳ {stats.todaySales.toLocaleString()}</h3>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              stats.todayTrend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {stats.todayTrend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(stats.todayTrend)}%
            </span>
          </div>
        </div>

        {/* Month to Date Revenue */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Month to Date</span>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white">৳ {stats.thisMonthSales.toLocaleString()}</h3>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              stats.thisMonthTrend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {stats.thisMonthTrend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(stats.thisMonthTrend)}%
            </span>
          </div>
        </div>

        {/* Annual Sales Stats */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Annual Stats</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white">৳ {stats.thisYearSales.toLocaleString()}</h3>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              stats.thisYearTrend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {stats.thisYearTrend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(stats.thisYearTrend)}%
            </span>
          </div>
        </div>

        {/* Active Products Summary */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Inventory</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white">{products.length} Items</h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {lowStockItems.length} warnings
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sales Trends (Last 7 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `৳${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual Order Funnel */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Order Funnel</h2>
            <p className="text-[11px] text-slate-400 mt-1">Order workflow distribution pipeline.</p>
          </div>
          
          <div className="space-y-4 my-auto py-4">
            {funnelStages.map((stage, idx) => {
              const maxCount = Math.max(...funnelStages.map(s => s.count)) || 1;
              const pct = (stage.count / maxCount) * 100;
              return (
                <div key={stage.name} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-white">{stage.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-400">{stage.count}</span>
                      <span className="text-[10px] text-slate-500">orders</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.02] border border-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(pct, stage.count > 0 ? 5 : 0)}%` }} 
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 font-light">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Low Stock Alerts */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Low Stock Alerts
        </h2>
        <div className="overflow-x-auto">
          {lowStockItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-white/5 rounded-xl">All products are well stocked.</p>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Attributes</th>
                  <th className="py-3 px-4 text-center">Restock Priority</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lowStockItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-4 text-white font-medium">{item.productName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{item.sku}</td>
                    <td className="py-3.5 px-4 text-slate-400">{item.attributes || '-'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${item.priorityClass}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-white">{item.stock} left</span>
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
