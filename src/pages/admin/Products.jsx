import React, { useState, useEffect } from 'react';
import { getDb, saveDb, initialProducts } from '../../utils/adminDb';
import { Plus, Trash2, ShieldAlert, Sparkles, Save, Edit3, X } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(29);
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    setProducts(getDb('admin-products', initialProducts));
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setBasePrice(product.variants?.[0]?.price || 29);
    setAttributes(product.attributes || []);
    setVariants(product.variants || []);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setBasePrice(29);
    setAttributes([]);
    setVariants([]);
    setIsEditing(true);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: '', valuesText: '', values: [] }]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    if (field === 'valuesText') {
      updated[index].values = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    setAttributes(updated);
  };

  const handleRemoveAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const generateVariantMatrix = () => {
    if (attributes.length === 0) {
      const sku = (name ? name.toUpperCase().replace(/\s+/g, '-') : 'PROD') + '-GEN';
      setVariants([{ sku, price: basePrice, stock: 10, attributeValues: {} }]);
      return;
    }

    let combinations = [{}];
    for (const attr of attributes) {
      if (!attr.name || attr.values.length === 0) continue;
      const temp = [];
      for (const combo of combinations) {
        for (const val of attr.values) {
          temp.push({
            ...combo,
            [attr.name]: val
          });
        }
      }
      combinations = temp;
    }

    const skuPrefix = name ? name.toUpperCase().substring(0, 5).replace(/\s+/g, '-') : 'SKU';
    const newVariants = combinations.map((combo, idx) => {
      const valStr = Object.values(combo).join('-');
      const sku = `${skuPrefix}-${valStr.toUpperCase()}-${idx + 101}`;
      return {
        sku,
        price: basePrice,
        stock: 10,
        attributeValues: combo
      };
    });

    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = field === 'sku' ? value : Number(value);
    setVariants(updated);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanAttributes = attributes.map(attr => ({
      name: attr.name,
      values: attr.values
    })).filter(attr => attr.name && attr.values.length > 0);

    const productData = {
      id: selectedProduct ? selectedProduct.id : Date.now(),
      name,
      description,
      attributes: cleanAttributes,
      variants
    };

    let updatedProducts;
    if (selectedProduct) {
      updatedProducts = products.map(p => p.id === selectedProduct.id ? productData : p);
    } else {
      updatedProducts = [...products, productData];
    }

    setProducts(updatedProducts);
    saveDb('admin-products', updatedProducts);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveDb('admin-products', updated);
    if (selectedProduct?.id === productId) {
      setIsEditing(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Variable Product Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Configure attributes, generate SKU matrix, and manage pricing/stock.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 self-start"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            const priceRange = product.variants?.length > 0
              ? [...new Set(product.variants.map(v => v.price))]
              : [];
            const displayPrice = priceRange.length > 1
              ? `$${Math.min(...priceRange)} - $${Math.max(...priceRange)}`
              : priceRange.length === 1 ? `$${priceRange[0]}` : '$0.00';

            return (
              <div
                key={product.id}
                className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white font-display">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{product.description || 'No description provided.'}</p>
                  
                  {product.attributes?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {product.attributes.map(attr => (
                        <span key={attr.name} className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] border border-white/5 text-slate-400">
                          {attr.name} ({attr.values.length})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Variants / Stock</span>
                    <span className="text-xs text-slate-300 font-medium">
                      {product.variants?.length || 0} var ({totalStock} units)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider text-right">Price Range</span>
                    <span className="text-sm font-semibold text-white block text-right">{displayPrice}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="flex-1 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Configure
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleSaveProduct} className="p-6 md:p-8 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white">
              {selectedProduct ? `Editing: ${selectedProduct.name}` : 'New Variable Product'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSelectedProduct(null);
              }}
              className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Mechanical Keyboard"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 h-28 resize-none transition-colors"
                  placeholder="Provide product details..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Default Base Price ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Product Attributes</h3>
                <p className="text-xs text-slate-500">Define properties like Color, Size to build variant matrices.</p>
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Attribute
              </button>
            </div>

            {attributes.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 italic">No attributes defined. Generating matrices creates a single default variant.</p>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-4 items-end bg-[#020617]/50 p-4 rounded-xl border border-white/5">
                    <div className="w-1/3">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">Attribute Name</label>
                      <input
                        type="text"
                        required
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        placeholder="e.g. Size"
                        className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">Values (comma-separated)</label>
                      <input
                        type="text"
                        required
                        value={attr.valuesText || attr.values?.join(', ') || ''}
                        onChange={(e) => handleAttributeChange(index, 'valuesText', e.target.value)}
                        placeholder="e.g. Small, Medium, Large"
                        className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Variant Price & Stock Matrix</h3>
                <p className="text-xs text-slate-500">Auto-generate the table from attributes to edit specific values.</p>
              </div>
              <button
                type="button"
                onClick={generateVariantMatrix}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Variant Matrix
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-xs text-slate-500">
                Click "Generate Variant Matrix" above to build stock items.
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#020617] text-slate-400 border-b border-white/10 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Variant Attributes</th>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4 w-28">Price ($)</th>
                      <th className="py-2.5 px-4 w-28 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#020617]/20">
                    {variants.map((v, index) => {
                      const displayAttr = Object.entries(v.attributeValues || {})
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(', ') || 'Default';

                      return (
                        <tr key={index} className="hover:bg-white/[0.01]">
                          <td className="py-2 px-4 font-medium text-white">{displayAttr}</td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              required
                              value={v.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              className="bg-[#020617] border border-white/10 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 w-full"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              value={v.price}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              className="bg-[#020617] border border-white/10 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-24"
                            />
                          </td>
                          <td className="py-2 px-4 text-right">
                            <input
                              type="number"
                              min="0"
                              required
                              value={v.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                              className="bg-[#020617] border border-white/10 rounded px-2 py-1 text-xs text-slate-300 text-right focus:outline-none focus:border-indigo-500 w-20"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSelectedProduct(null);
              }}
              className="px-4.5 py-2.5 bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              Save Product
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
