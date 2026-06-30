import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import { ArrowLeft, CreditCard, Truck, Tag, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [cart, setCart] = useState([]);
  const [shippingZones, setShippingZones] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Customer Info 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping Destination
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Order Options
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Mock Credit Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchShippingZones = async () => {
    try {
      const res = await fetch(`${apiBase}/api/shipping`);
      const data = await res.json();
      setShippingZones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch shipping zones", error);
      addToast("Failed to retrieve shipping zone specifications.", "error");
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


  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Auto-format expiry date 
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardExpiry(value);
  };


  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvv(value);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch(`${apiBase}/api/coupon/validate`, {
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
        addToast(`Discount coupon "${couponCode.trim().toUpperCase()}" applied!`);
      } else {
        addToast(data.message || "Invalid or inactive coupon code.", "error");
        setAppliedCoupon(null);
      }
    } catch (error) {
      addToast("Failed to validate coupon code with server.", "error");
      setAppliedCoupon(null);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast("Your checkout cart is empty.", "error");
      return;
    }
    if (!selectedZoneId) {
      addToast("Please select a valid destination shipping zone.", "error");
      return;
    }

    // Additional Credit Card verification
    if (paymentMethod === 'Mock Credit Card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length !== 16) {
        addToast("Please enter a valid 16-digit card number.", "error");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        addToast("Please enter a valid expiry date (MM/YY).", "error");
        return;
      }
      const [month, year] = cardExpiry.split('/').map(Number);
      if (month < 1 || month > 12) {
        addToast("Please enter a valid expiry month (01-12).", "error");
        return;
      }
      if (cardCvv.length !== 3) {
        addToast("Please enter a valid 3-digit CVV security code.", "error");
        return;
      }
      if (!cardName.trim()) {
        addToast("Please enter the name on the card.", "error");
        return;
      }
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
      const res = await fetch(`${apiBase}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('arbeit-cart');
        setCart([]);
        addToast("Order placed successfully! Redirecting to storefront...", "success");
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        addToast(data.message || "Failed to submit order. Verify stock availability.", "error");
      }
    } catch (error) {
      addToast("Failed to connect to the backend database server.", "error");
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
          
            {/* Form details */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                
                {/* Customer Details */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full sm:col-span-2 bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Shipping Destination */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Shipping Destination</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Zone & Payment Choice */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Zone & Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Shipping Zone</label>
                      <select
                        required
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                      >
                        <option value="">Select Destination Zone</option>
                        {shippingZones.map(zone => (
                          <option key={zone._id} value={zone._id}>
                            {zone.zoneName} (+৳ {zone.cost})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Payment Choice</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                      >
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="Mock Credit Card">Mock Credit Card Payment</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mock Credit Card fields */}
                {paymentMethod === 'Mock Credit Card' && (
                  <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/5 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <CreditCard className="h-4 w-4 text-indigo-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Card Credentials</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wide">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wide">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wide">CVV Code</label>
                        <input
                          type="password"
                          required
                          placeholder="***"
                          value={cardCvv}
                          onChange={handleCvvChange}
                          className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wide">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-[0.99]"
                >
                  Confirm Checkout (৳ {totalAmount.toLocaleString()})
                </button>
              </form>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-white/5 bg-[#070b16]/60 backdrop-blur-xl space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Order Summary</h3>

                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 italic text-center">Your checkout cart is empty.</p>
                ) : (
                  <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</h4>
                          <span className="text-[9px] text-slate-500 uppercase font-medium tracking-wide">SKU: {item.variant.sku} × {item.quantity}</span>
                        </div>
                        <span className="text-xs font-bold text-white">৳ {(item.price * item.quantity).toLocaleString()}</span>
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
                    className="flex-1 bg-[#020617] border border-white/5 rounded-xl px-4 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500/50"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                <div className="space-y-2.5 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Items Subtotal</span>
                    <span className="text-slate-200">৳ {itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Fee</span>
                    <span className="text-slate-200">৳ {shippingCost.toLocaleString()}</span>
                  </div>
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-indigo-400 font-medium">
                      <span>Applied Coupon ({appliedCoupon.code})</span>
                      <span>- ৳ {discountApplied.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-3">
                    <span className="text-white">Grand Total</span>
                    <span className="text-indigo-400 font-extrabold text-sm">৳ {totalAmount.toLocaleString()}</span>
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
