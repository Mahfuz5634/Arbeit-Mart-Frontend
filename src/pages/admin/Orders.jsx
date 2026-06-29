import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Search, 
  ShoppingBag, 
  User, 
  Phone, 
  CreditCard,
  Check
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Search and Tab Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const getApiUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/order`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local orders list
        const updatedOrders = orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o);
        setOrders(updatedOrders);
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
      case 'Confirmed':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
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
        return <Clock className="w-3 h-3" />;
      case 'Confirmed':
        return <Check className="w-3 h-3" />;
      case 'Shipped':
        return <Truck className="w-3 h-3" />;
      case 'Delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'Cancelled':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    
    const idStr = (order._id || '').toLowerCase();
    const nameStr = (order.customerInfo?.name || '').toLowerCase();
    const phoneStr = (order.customerInfo?.phone || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = idStr.includes(query) || nameStr.includes(query) || phoneStr.includes(query);
    
    return matchesStatus && matchesSearch;
  });

 
  const renderQuickAction = (order) => {
    const status = order.orderStatus;
    if (status === 'Pending') {
      return (
        <button
          onClick={() => handleStatusChange(order._id, 'Confirmed')}
          className="px-3 py-1 bg-blue-650 hover:bg-blue-600 border border-blue-600/30 text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Confirm
        </button>
      );
    }
    if (status === 'Confirmed') {
      return (
        <button
          onClick={() => handleStatusChange(order._id, 'Shipped')}
          className="px-3 py-1 bg-indigo-650 hover:bg-indigo-600 border border-indigo-600/30 text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Ship
        </button>
      );
    }
    if (status === 'Shipped') {
      return (
        <button
          onClick={() => handleStatusChange(order._id, 'Delivered')}
          className="px-3 py-1 bg-emerald-650 hover:bg-emerald-600 border border-emerald-600/30 text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Deliver
        </button>
      );
    }
    return (
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">-</span>
    );
  };

  const tabs = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Order Control Panel</h1>
          <p className="text-xs text-slate-400 mt-1">Review recent customer transactions, update order statuses, and verify delivery contents.</p>
        </div>
      </div>

     
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
     
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-2 px-2 lg:mx-0 lg:px-0">
          {tabs.map((tab) => {
            const count = tab === 'All' ? orders.length : orders.filter(o => o.orderStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-full px-4.5 py-2 text-xs font-semibold tracking-wide transition-all duration-350 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/[0.05] hover:text-slate-200'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab ? 'bg-indigo-750 text-white' : 'bg-slate-950 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

     
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, name, phone..."
            className="w-full rounded-full bg-white/[0.03] border border-white/5 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-550 focus:bg-[#090d1f] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : (
      
        <div className="rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#020617] text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-4 px-6 w-12 text-center">Info</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6 text-right">Total (৳)</th>
                  <th className="py-4 px-6">Workflow Status</th>
                  <th className="py-4 px-6 text-center">Progress Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  const formattedDate = order.createdAt 
                    ? new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                    : 'N/A';
                  return (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-white/[0.01] transition-colors duration-200">
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toggleExpand(order._id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-4 px-6 font-mono text-white font-semibold text-[11px] select-all">{order._id}</td>
                        <td className="py-4 px-6 font-light">
                          <div className="font-semibold text-white">{order.customerInfo?.name || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{order.customerInfo?.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-light">{formattedDate}</td>
                        <td className="py-4 px-6 text-right text-white font-bold">৳ {order.totalAmount?.toLocaleString() || 0}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            {order.orderStatus}
                          </span>
                        </td>
                        
                      
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {renderQuickAction(order)}
                            
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="bg-[#020617] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-400 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      
                    
                      {isExpanded && (
                        <tr className="bg-[#020617]/30">
                          <td colSpan="7" className="py-5 px-8 border-t border-white/5">
                            <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-400 pb-4 border-b border-white/5 font-light leading-relaxed">
                                <div className="space-y-1.5">
                                  <p className="font-bold text-slate-300 uppercase tracking-widest text-[9px] flex items-center gap-1"><User className="w-3.5 h-3.5 text-indigo-400" /> Customer Information</p>
                                  <p>Name: <span className="text-white font-medium">{order.customerInfo?.name}</span></p>
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-600" />
                                    <span>Phone: {order.customerInfo?.phone}</span>
                                  </p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="font-bold text-slate-300 uppercase tracking-widest text-[9px] flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-indigo-400" /> Shipping Destination</p>
                                  <p>Address: <span className="text-white font-medium">{order.shippingAddress?.address}</span></p>
                                  <p>City / Zone: <span className="text-white font-medium">{order.shippingAddress?.city}</span></p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="font-bold text-slate-300 uppercase tracking-widest text-[9px] flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Transaction Summary</p>
                                  <p>Method: <span className="text-white font-medium uppercase">{order.paymentMethod}</span></p>
                                  <p>Delivery Charge: ৳ {order.shippingCost}</p>
                                  {order.couponInfo?.code && (
                                    <p className="text-indigo-400 font-medium">Coupon: {order.couponInfo.code} (-৳ {order.couponInfo.discountApplied})</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> Order items contents
                                </h4>
                                <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-950/20">
                                  <table className="w-full text-left text-[11px] text-slate-400">
                                    <thead className="bg-[#020617]/50 text-slate-500 uppercase font-bold tracking-wider text-[9px] border-b border-white/5">
                                      <tr>
                                        <th className="py-2.5 px-4">Item Name / Option SKU</th>
                                        <th className="py-2.5 px-4 text-center">Quantity</th>
                                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {order.orderItems?.map((item, idx) => {
                                        const productName = item.product?.name || 'Unknown Product';
                                        return (
                                          <tr key={idx} className="hover:bg-white/[0.01]">
                                            <td className="py-2.5 px-4 text-slate-300 font-medium">
                                              {productName}
                                              <span className="block font-mono text-[9px] text-slate-500 mt-0.5">{item.variantSku}</span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center text-white">{item.quantity}</td>
                                            <td className="py-2.5 px-4 text-right">৳ {item.price.toLocaleString()}</td>
                                            <td className="py-2.5 px-4 text-right text-slate-200 font-bold">৳ {(item.quantity * item.price).toLocaleString()}</td>
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
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500 font-light">
                      No customer orders found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
