import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';

export default function Shipping() {
  const [shippingZones, setShippingZones] = useState([]);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [cost, setCost] = useState('');

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
    fetchShippingZones();
  }, []);

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!name.trim() || !region.trim() || !cost) return;

    try {
      const res = await fetch('http://localhost:5000/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: name.trim(),
          regions: region.split(',').map(r => r.trim()).filter(r => r.length > 0),
          cost: Number(cost)
        })
      });

      if (res.ok) {
        fetchShippingZones();
        setName('');
        setRegion('');
        setCost('');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to create shipping zone", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipping zone?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/shipping/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchShippingZones();
      }
    } catch (error) {
      console.error("Failed to delete shipping zone", error);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Shipping Configurations</h1>
        <p className="text-sm text-slate-400 mt-1">Manage delivery regions, zones, and standard shipping flat rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl h-fit space-y-6">
          <h2 className="text-lg font-semibold text-white">Add Shipping Zone</h2>
          
          <form onSubmit={handleCreateZone} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Zone Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Domestic Express"
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Covered Regions (Comma separated)</label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Dhaka, Chittagong"
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Flat Rate Cost (৳)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="10.00"
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Configured Zones & Rates</h2>
          
          <div className="overflow-x-auto">
            {shippingZones.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 italic text-center">No shipping zones configured yet.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Zone Name</th>
                    <th className="py-3 px-4">Covered Regions</th>
                    <th className="py-3 px-4 text-right">Cost</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shippingZones.map((zone) => (
                    <tr key={zone._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 text-white font-medium">
                        <span className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-indigo-400" />
                          {zone.zoneName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {Array.isArray(zone.regions) ? zone.regions.join(', ') : zone.regions}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white text-right">
                        ৳ {zone.cost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(zone._id)}
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
