import React, { useState, useEffect } from 'react';
import { getDb, saveDb, initialOrders } from '../../utils/adminDb';
import { Eye, ChevronDown, ChevronUp, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    setOrders(getDb('admin-orders', initialOrders));
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    saveDb('admin-orders', updated);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Shipped':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'Shipped':
        return <Truck className="w-3.5 h-3.5" />;
      case 'Delivered':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Cancelled':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Order Control Panel</h1>
        <p className="text-sm text-slate-400 mt-1">Review recent customer transactions, update order statuses, and verify contents.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#020617] text-slate-400 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="py-4 px-6 w-12"></th>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Total Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-4 px-6 font-mono text-white font-medium">{order.id}</td>
                      <td className="py-4 px-6">{order.customerName}</td>
                      <td className="py-4 px-6 text-slate-400">{order.date}</td>
                      <td className="py-4 px-6 text-right text-white font-semibold">${order.total}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-[#020617] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#020617]/30">
                        <td colSpan="7" className="py-4 px-8 border-t border-white/5">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</h4>
                            <div className="overflow-hidden rounded-xl border border-white/5">
                              <table className="w-full text-left text-xs text-slate-400">
                                <thead className="bg-[#020617]/50 text-slate-500 uppercase font-semibold">
                                  <tr>
                                    <th className="py-2 px-4">Item Name</th>
                                    <th className="py-2 px-4 text-center">Qty</th>
                                    <th className="py-2 px-4 text-right">Unit Price</th>
                                    <th className="py-2 px-4 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {order.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.01]">
                                      <td className="py-2 px-4 text-slate-300 font-medium">{item.name}</td>
                                      <td className="py-2 px-4 text-center">{item.quantity}</td>
                                      <td className="py-2 px-4 text-right">${item.price}</td>
                                      <td className="py-2 px-4 text-right text-slate-200">${item.quantity * item.price}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
