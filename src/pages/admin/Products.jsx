import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, Save, Edit3, X, Image as ImageIcon, CheckCircle, Package, Tag, Settings } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/product');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('https://api.imgbb.com/1/upload?key=7a5c3a7dddd676591dd0c82c4178df30', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.data && data.data.url) {
        setCoverImage(data.data.url);
      } else {
        alert(`Image upload failed: ${data.error?.message || "Invalid response"}`);
      }
    } catch (error) {
      alert(`Image upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVariantImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const updated = [...variants];
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('https://api.imgbb.com/1/upload?key=7a5c3a7dddd676591dd0c82c4178df30', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.data && data.data.url) {
        updated[index].image = data.data.url;
        setVariants(updated);
      } else {
        alert(`Variant image upload failed: ${data.error?.message || "Invalid response"}`);
      }
    } catch (error) {
      alert(`Variant image upload failed: ${error.message}`);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setCategory(product.category || '');
    setBasePrice(product.basePrice || 0);
    setAttributes(product.attributes || []);
    setVariants(product.variants || []);
    setCoverImage(product.coverImage || '');
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setCategory('');
    setBasePrice(0);
    setAttributes([]);
    setVariants([]);
    setCoverImage('');
    setIsEditing(true);
  };

  const handleAddAttribute = () => setAttributes([...attributes, { name: '', valuesText: '', values: [] }]);
  const handleRemoveAttribute = (index) => setAttributes(attributes.filter((_, i) => i !== index));

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    if (field === 'valuesText') {
      updated[index].values = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    setAttributes(updated);
  };

  const generateVariantMatrix = () => {
    if (attributes.length === 0) {
      const sku = (name ? name.toUpperCase().replace(/\s+/g, '-') : 'PROD') + '-GEN';
      setVariants([{ sku, price: basePrice, stock: 10, attributes: {}, image: coverImage }]);
      return;
    }

    let combinations = [{}];
    for (const attr of attributes) {
      if (!attr.name || attr.values.length === 0) continue;
      const temp = [];
      for (const combo of combinations) {
        for (const val of attr.values) {
          temp.push({ ...combo, [attr.name]: val });
        }
      }
      combinations = temp;
    }

    const skuPrefix = name ? name.toUpperCase().substring(0, 5).replace(/\s+/g, '-') : 'SKU';
    const newVariants = combinations.map((combo, idx) => {
      const valStr = Object.values(combo).join('-');
      return {
        sku: `${skuPrefix}-${valStr.toUpperCase()}-${idx + 101}`,
        price: basePrice,
        stock: 10,
        attributes: combo,
        image: coverImage
      };
    });

    setVariants(newVariants);
  };

  const handleAddVariantManually = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const skuPrefix = name ? name.toUpperCase().substring(0, 5).replace(/\s+/g, '-') : 'SKU';
    
    const defaultAttrs = {};
    attributes.forEach(attr => {
      if (attr.name) defaultAttrs[attr.name] = attr.values[0] || '';
    });

    setVariants([...variants, { sku: `${skuPrefix}-MAN-${randomSuffix}`, price: basePrice, stock: 10, attributes: defaultAttrs, image: coverImage }]);
  };

  const handleRemoveVariant = (variantIndex) => setVariants(variants.filter((_, idx) => idx !== variantIndex));

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = (field === 'sku' || field === 'image') ? value : Number(value);
    setVariants(updated);
  };

  const handleVariantAttributeChange = (variantIndex, attributeName, value) => {
    const updated = [...variants];
    const currentAttrs = updated[variantIndex].attributes || {};
    updated[variantIndex].attributes = { ...currentAttrs, [attributeName]: value };
    setVariants(updated);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    let finalVariants = variants;
    if (variants.length === 0) {
      const sku = (name ? name.toUpperCase().replace(/\s+/g, '-') : 'PROD') + '-GEN';
      finalVariants = [{ sku, price: basePrice, stock: 10, attributes: {}, image: coverImage }];
    }

    // Ensures structure exactly matches required JSON
    const productData = {
      name,
      description,
      category,
      basePrice,
      coverImage,
      attributes: attributes.map(attr => ({ name: attr.name, values: attr.values })),
      variants: finalVariants,
      isActive: true
    };

    try {
      const url = selectedProduct ? `http://localhost:5000/api/product/${selectedProduct._id}` : 'http://localhost:5000/api/product';
      const method = selectedProduct ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      fetchProducts();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`http://localhost:5000/api/product/${productId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-500" /> 
              Product Inventory
            </h1>
            <p className="text-slate-400 mt-2">Manage your catalog, attributes, and variations.</p>
          </div>
          {!isEditing && (
            <button onClick={handleAddNew} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/50">
              <Plus className="w-5 h-5" /> Add New Product
            </button>
          )}
        </div>

        {/* Views */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group shadow-xl shadow-black/20 flex flex-col">
                <div className="relative h-48 bg-slate-950">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-md text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                    {product.category || 'Uncategorized'}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <div className="flex items-center justify-between py-3 border-t border-slate-800 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Base Price</span>
                      <span className="text-white font-bold">৳{product.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Variants</span>
                      <span className="text-indigo-400 font-medium">{product.variants?.length || 0}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => handleSelectProduct(product)} className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDeleteProduct(product._id)} className="flex items-center justify-center gap-2 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-900/30">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300">No products found</h3>
                <p className="text-slate-500 mt-2">Get started by creating your first product.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveProduct} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 sticky top-4 z-10 shadow-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedProduct ? 'Edit Product Details' : 'Create New Product'}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column: Basic Info & Image */}
              <div className="xl:col-span-1 space-y-8">
                {/* Basic Details Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-white">General Information</h3>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Product Name</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                      <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                        <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Base Price (৳)</label>
                        <input type="number" required value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-white">Cover Image</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {coverImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button type="button" onClick={() => setCoverImage('')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 bg-slate-950/50">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">No cover image</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Or paste image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                      <div className="relative">
                        <button type="button" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                        <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Attributes & Variants */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Attributes Builder */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-slate-400" />
                      <h3 className="font-semibold text-white">Product Attributes</h3>
                    </div>
                    <button type="button" onClick={handleAddAttribute} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20">
                      <Plus className="w-4 h-4" /> Add Attribute
                    </button>
                  </div>
                  <div className="p-6">
                    {attributes.length === 0 ? (
                      <p className="text-slate-500 text-center py-6 text-sm">No attributes added yet. Add attributes (e.g., Color, Size) to generate variations.</p>
                    ) : (
                      <div className="space-y-4">
                        {attributes.map((attr, index) => (
                          <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <div className="w-full sm:w-1/3">
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Attribute Name</label>
                              <input type="text" placeholder="e.g., Color" value={attr.name} onChange={(e) => handleAttributeChange(index, 'name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="flex-1 w-full">
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Values (Comma separated)</label>
                              <input type="text" placeholder="e.g., Matte Black, Glacier White" value={attr.valuesText !== undefined ? attr.valuesText : (attr.values?.join(', ') || '')} onChange={(e) => handleAttributeChange(index, 'valuesText', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <button type="button" onClick={() => handleRemoveAttribute(index)} className="p-2.5 mt-5 sm:mt-0 bg-red-950/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors border border-red-900/50 shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Variants Manager */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-slate-400" />
                      <h3 className="font-semibold text-white">Variants & Inventory</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={generateVariantMatrix} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-500/20">
                        <CheckCircle className="w-4 h-4" /> Generate Matrix
                      </button>
                      <button type="button" onClick={handleAddVariantManually} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
                        <Plus className="w-4 h-4" /> Add Row
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-0 overflow-x-auto">
                    {variants.length === 0 ? (
                      <div className="py-16 text-center px-4">
                        <Layers className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-slate-300">No variants generated</h4>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">Click "Generate Matrix" to automatically create combinations from your attributes, or add them manually.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                          <tr>
                            <th className="px-6 py-4 font-medium w-20">Image</th>
                            <th className="px-6 py-4 font-medium w-48">SKU</th>
                            <th className="px-6 py-4 font-medium">Attributes</th>
                            <th className="px-6 py-4 font-medium w-32">Price (৳)</th>
                            <th className="px-6 py-4 font-medium w-28">Stock</th>
                            <th className="px-6 py-4 font-medium text-right w-20">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {variants.map((v, index) => (
                            <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                              {/* Variant Image */}
                              <td className="px-6 py-4">
                                <div className="relative w-12 h-12 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                                  {v.image ? (
                                    <img src={v.image} alt="Variant" className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-slate-600" />
                                  )}
                                  <input type="file" accept="image/*" onChange={(e) => handleVariantImageUpload(index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Upload variant image" />
                                </div>
                              </td>
                              
                              {/* Variant SKU */}
                              <td className="px-6 py-4">
                                <input type="text" value={v.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 hover:border-slate-700 px-1 py-1.5 text-sm font-mono text-slate-300 outline-none transition-colors" />
                              </td>
                              
                              {/* Variant Attributes Dropdowns */}
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {attributes.length === 0 ? <span className="text-xs text-slate-500 italic px-2 py-1 bg-slate-950 rounded border border-slate-800">Default Variant</span> : null}
                                  {attributes.map(attr => {
                                    if (!attr.name) return null;
                                    const currentVal = (v.attributes || {})[attr.name] || '';
                                    return (
                                      <div key={attr.name} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-2 py-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{attr.name}:</span>
                                        <select value={currentVal} onChange={(e) => handleVariantAttributeChange(index, attr.name, e.target.value)} className="bg-transparent text-xs text-slate-300 outline-none w-20 appearance-none cursor-pointer">
                                          <option value="">Select</option>
                                          {attr.values.map(val => <option key={val} value={val}>{val}</option>)}
                                        </select>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              
                              {/* Price */}
                              <td className="px-6 py-4">
                                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 overflow-hidden focus-within:border-indigo-500 transition-colors">
                                  <span className="text-slate-500 text-sm">৳</span>
                                  <input type="number" value={v.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full bg-transparent px-2 py-2 text-sm text-slate-200 outline-none" />
                                </div>
                              </td>
                              
                              {/* Stock */}
                              <td className="px-6 py-4">
                                <input type="number" value={v.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors" />
                              </td>
                              
                              {/* Action */}
                              <td className="px-6 py-4 text-right">
                                <button type="button" onClick={() => handleRemoveVariant(index)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
          </form>
        )}
      </div>
    </div>
  );
}