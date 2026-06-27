import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import { ArrowLeft, CreditCard, Truck, Tag, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [shippingZones, setShippingZones] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchShippingZones = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/shipping');
      const data = await res.json();
      setShippingZones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch shipping zones", error);
    }
  };

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('arbeit-cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error(err);
    }
    fetchShippingZones();
  }, []);

  const itemsPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const selectedZone = shippingZones.find(z => z._id === selectedZoneId);
  const shippingCost = selectedZone ? selectedZone.cost : 0;

  const discountApplied = appliedCoupon
    ? Number(((itemsPrice * appliedCoupon.percentage) / 100).toFixed(2))
    : 0;

  const totalAmount = Math.max(0, itemsPrice + shippingCost - discountApplied);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          percentage: data.discountPercentage
        });
        addToast(`Coupon "${couponCode.trim().toUpperCase()}" applied successfully!`);
      } else {
        addToast(data.message || "Invalid coupon code.", "error");
        setAppliedCoupon(null);
      }
    } catch (error) {
      addToast("Failed to validate coupon code.", "error");
      setAppliedCoupon(null);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast("Your cart is empty.", "error");
      return;
    }
    if (!selectedZoneId) {
      addToast("Please select a shipping zone.", "error");
      return;
    }

    const payload = {
      customerInfo: { name, email, phone },
      orderItems: cart.map(item => ({
        product: item.product._id,
        variantSku: item.variant.sku,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: { address, city, postalCode },
      shippingZone: selectedZoneId,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      paymentMethod
    };

    try {
      const res = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('arbeit-cart');
        setCart([]);
        addToast("Order placed successfully! Redirecting...");
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        addToast(data.message || "Failed to submit order.", "error");
      }
    } catch (error) {
      addToast("Failed to connect to the server.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased flex flex-col justify-between">
      <div>
        <Navbar cartCount={0} onCartClick={() => {}} />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors duration-200 mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Catalog</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmitOrder} className="space-y-8">
                <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Customer Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full sm:col-span-2 bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Shipping Destination</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Zone & Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-1.5 uppercase">Shipping Zone</label>
                      <select
                        required
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Select Zone</option>
                        {shippingZones.map(zone => (
                          <option key={zone._id} value={zone._id}>
                            {zone.zoneName} (+৳ {zone.cost})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-1.5 uppercase">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="Mock Credit Card">Mock Credit Card</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-indigo-600/20"
                >
                  Place Order (৳ {totalAmount.toLocaleString()})
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Order Summary</h3>

                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 italic text-center">Your shopping cart is empty.</p>
                ) : (
                  <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</h4>
                          <span className="text-[10px] text-slate-500">Qty: {item.quantity} × ৳ {item.price}</span>
                        </div>
                        <span className="text-xs font-bold text-white">৳ {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#020617] border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </form>

                <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-200">৳ {itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Cost</span>
                    <span className="text-slate-200">৳ {shippingCost.toLocaleString()}</span>
                  </div>
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-indigo-400">
                      <span>Discount</span>
                      <span>- ৳ {discountApplied.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-3">
                    <span className="text-white">Total Amount</span>
                    <span className="text-indigo-400">৳ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}
