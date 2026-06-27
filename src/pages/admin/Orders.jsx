import React, { useState, useEffect } from 'react';
import { Eye, ChevronDown, ChevronUp, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/order');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to change order status", error);
    }
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
                const isExpanded = expandedOrderId === order._id;
                const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
                return (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleExpand(order._id)}
                          className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-4 px-6 font-mono text-white font-medium text-xs truncate max-w-[120px]">{order._id}</td>
                      <td className="py-4 px-6">{order.customerInfo?.name || 'N/A'}</td>
                      <td className="py-4 px-6 text-slate-400">{formattedDate}</td>
                      <td className="py-4 px-6 text-right text-white font-semibold">৳ {order.totalAmount?.toLocaleString() || 0}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-[#020617] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#020617]/30">
                        <td colSpan="7" className="py-4 px-8 border-t border-white/5">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 pb-2 border-b border-white/5">
                              <div>
                                <p className="font-bold text-slate-300 uppercase tracking-wider mb-1">Shipping Info</p>
                                <p>{order.customerInfo?.phone}</p>
                                <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                              </div>
                              <div>
                                <p className="font-bold text-slate-300 uppercase tracking-wider mb-1">Details</p>
                                <p>Payment: {order.paymentMethod}</p>
                                <p>Shipping Cost: ৳ {order.shippingCost}</p>
                                {order.couponInfo?.code && (
                                  <p>Coupon: {order.couponInfo.code} (-৳ {order.couponInfo.discountApplied})</p>
                                )}
                              </div>
                            </div>
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
                                    {order.orderItems?.map((item, idx) => {
                                      const productName = item.product?.name || 'Unknown Product';
                                      return (
                                        <tr key={idx} className="hover:bg-white/[0.01]">
                                          <td className="py-2 px-4 text-slate-300 font-medium">{productName} ({item.variantSku})</td>
                                          <td className="py-2 px-4 text-center">{item.quantity}</td>
                                          <td className="py-2 px-4 text-right">৳ {item.price}</td>
                                          <td className="py-2 px-4 text-right text-slate-200">৳ {item.quantity * item.price}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
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
