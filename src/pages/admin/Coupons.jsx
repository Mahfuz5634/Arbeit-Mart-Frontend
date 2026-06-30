import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, Check, X } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('');
  const [active, setActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupon`);
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !value) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountPercentage: Number(value),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: active
        })
      });

      if (res.ok) {
        fetchCoupons();
        setCode('');
        setValue('');
        setActive(true);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to create coupon", error);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Failed to toggle coupon active status", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon code?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupon/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Failed to delete coupon", error);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Coupons & Discounts</h1>
        <p className="text-sm text-slate-400 mt-1">Create promotional codes, toggle active statuses, and configure discount percentages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl h-fit space-y-6">
          <h2 className="text-lg font-semibold text-white">Create Coupon</h2>
          
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SAVE20"
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="20"
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-white/10 bg-[#020617] text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="active" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                Make Coupon Active Immediately
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Generate Coupon
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Active Discount Codes</h2>
          
          <div className="overflow-x-auto">
            {coupons.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 italic text-center">No coupon codes configured yet.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-sm text-white font-semibold tracking-wider">
                        <span className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-indigo-400" />
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {coupon.discountPercentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            coupon.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <Check className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
