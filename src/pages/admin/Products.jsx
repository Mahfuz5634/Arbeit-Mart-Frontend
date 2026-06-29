import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Save, 
  Edit3, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  Package, 
  Tag, 
  Settings, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';

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

  // Bulk Edit states
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const getApiUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/product`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
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
        alert(`Cover image upload failed: ${data.error?.message || "Invalid response"}`);
      }
    } catch (error) {
      alert(`Cover image upload failed: ${error.message}`);
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
    setBulkPrice('');
    setBulkStock('');
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
    setBulkPrice('');
    setBulkStock('');
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

  const handleApplyPreset = (presetName, presetValues) => {
    const valuesString = presetValues.join(', ');
    setAttributes([...attributes, { name: presetName, valuesText: valuesString, values: presetValues }]);
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

  const handleApplyBulkPrice = () => {
    if (bulkPrice === '') return;
    const priceVal = Number(bulkPrice);
    setVariants(variants.map(v => ({ ...v, price: priceVal })));
  };

  const handleApplyBulkStock = () => {
    if (bulkStock === '') return;
    const stockVal = Number(bulkStock);
    setVariants(variants.map(v => ({ ...v, stock: stockVal })));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    let finalVariants = variants;
    if (variants.length === 0) {
      const sku = (name ? name.toUpperCase().replace(/\s+/g, '-') : 'PROD') + '-GEN';
      finalVariants = [{ sku, price: basePrice, stock: 10, attributes: {}, image: coverImage }];
    }

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
      const url = selectedProduct ? `${getApiUrl()}/api/product/${selectedProduct._id}` : `${getApiUrl()}/api/product`;
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
      await fetch(`${getApiUrl()}/api/product/${productId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const getDuplicateSkus = () => {
    const counts = {};
    const duplicates = new Set();
    variants.forEach(v => {
      if (v.sku) {
        counts[v.sku] = (counts[v.sku] || 0) + 1;
        if (counts[v.sku] > 1) duplicates.add(v.sku);
      }
    });
    return duplicates;
  };

  const duplicateSkus = getDuplicateSkus();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8 font-sans animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
       
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-500" /> 
              Product Inventory
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage store catalog, attributes builder, and variant pricing matrices.</p>
          </div>
          {!isEditing && (
            <button onClick={handleAddNew} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/50 cursor-pointer">
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          )}
        </div>

      
        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-[#0b0f19]/40 border border-white/[0.04] rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-[#0b0f19]/70 transition-all duration-300 group flex flex-col hover:shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                <div className="relative h-48 bg-slate-950">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <ImageIcon className="w-12 h-12 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-md text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                    {product.category || 'Uncategorized'}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-300">{product.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 leading-relaxed font-light">{product.description}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between py-3 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Base Price</span>
                        <span className="text-white font-bold text-xs mt-0.5">৳ {product.basePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Variants</span>
                        <span className="text-indigo-400 font-bold text-xs mt-0.5">{product.variants?.length || 0} combin.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button type="button" onClick={() => handleSelectProduct(product)} className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(product._id)} className="flex items-center justify-center gap-2 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-900/30 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
                <Package className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50 animate-pulse" />
                <h3 className="text-lg font-medium text-slate-300">No products found</h3>
                <p className="text-xs text-slate-500 mt-2">Get started by creating your first product inventory.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveProduct} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-white/5 sticky top-4 z-10 shadow-2xl">
              <div>
                <h2 className="text-sm font-bold text-white">{selectedProduct ? `Modify: ${name}` : 'Configure New Workspace Gear'}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 hover:bg-white/5 text-slate-350 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Save className="w-4 h-4" /> Save Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column: Basic Info & Image */}
              <div className="xl:col-span-1 space-y-8">
                {/* General Information */}
                <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#0b0f19]/35 flex items-center gap-2">
                    <Settings className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">General Information</h3>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Name</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                      <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none transition-all resize-none font-light leading-relaxed" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                        <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Base Price (৳)</label>
                        <input type="number" required value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

              
                <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#0b0f19]/35 flex items-center gap-2">
                    <ImageIcon className="w-4.5 h-4.5 text-indigo-400" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Cover Image</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {coverImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10 group">
                        <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button type="button" onClick={() => setCoverImage('')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-500 bg-slate-950/50">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                        <span className="text-xs font-light">No cover image uploaded</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Or paste image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-light" />
                      <div className="relative">
                        <button type="button" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer">
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

           
              <div className="xl:col-span-2 space-y-8">
                
              
                <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#0b0f19]/35 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4.5 h-4.5 text-indigo-400" />
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider">Product Attributes</h3>
                    </div>
                    <button type="button" onClick={handleAddAttribute} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-455 rounded-lg text-xs font-semibold transition-colors border border-indigo-500/20 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Attribute
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    {/* Preset Templates */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                       <span>Quick Attribute Presets</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          type="button" 
                          onClick={() => handleApplyPreset('Size', ['Small', 'Medium', 'Large', 'Extra Large'])}
                          className="px-2.5 py-1 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-slate-400 hover:text-white rounded-md text-[10px] transition-colors cursor-pointer"
                        >
                          + Size Options
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleApplyPreset('Color', ['Slate Gray', 'Matte Black', 'Glacier White', 'Indigo Blue'])}
                          className="px-2.5 py-1 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-slate-400 hover:text-white rounded-md text-[10px] transition-colors cursor-pointer"
                        >
                          + Color Presets
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleApplyPreset('Material', ['Anodized Aluminum', 'Solid Walnut', 'PBT Thermoplastic', 'Premium Leather'])}
                          className="px-2.5 py-1 bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-slate-400 hover:text-white rounded-md text-[10px] transition-colors cursor-pointer"
                        >
                          + Materials
                        </button>
                      </div>
                    </div>

                    {attributes.length === 0 ? (
                      <p className="text-slate-500 text-center py-6 text-xs">No attributes added yet. Add custom options above or click presets to auto-load configuration.</p>
                    ) : (
                      <div className="space-y-4">
                        {attributes.map((attr, index) => (
                          <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-950 border border-white/5 rounded-xl">
                            <div className="w-full sm:w-1/3">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Attribute Name</label>
                              <input type="text" placeholder="e.g., Size" value={attr.name} onChange={(e) => handleAttributeChange(index, 'name', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="flex-1 w-full">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Values (Comma separated)</label>
                              <input type="text" placeholder="e.g., Small, Medium, Large" value={attr.valuesText !== undefined ? attr.valuesText : (attr.values?.join(', ') || '')} onChange={(e) => handleAttributeChange(index, 'valuesText', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <button type="button" onClick={() => handleRemoveAttribute(index)} className="p-2.5 mt-5 sm:mt-0 bg-red-950/40 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors border border-red-900/30 shrink-0 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              
                <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#0b0f19]/35 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
      
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider">Combinations & Matrix</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={generateVariantMatrix} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 rounded-lg text-xs font-semibold transition-colors border border-emerald-500/20 cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" /> Generate Matrix
                      </button>
                      <button type="button" onClick={handleAddVariantManually} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-white/5 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>
                  </div>

                  {variants.length > 0 && (
                 
                    <div className="p-4 bg-slate-950 border-b border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Bulk Price (৳)"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkPrice}
                          className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-600 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                        >
                          Apply Price
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Bulk Stock"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkStock}
                          className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-600 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                        >
                          Apply Stock
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-0 overflow-x-auto">
                    {variants.length === 0 ? (
                      <div className="py-16 text-center px-4">
                        <Layers className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-55" />
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide">No variant combos configured</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-light">Generate the combination matrix from your attributes builder, or build individual custom rows manually.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                          <tr>
                            <th className="px-6 py-3.5 font-bold w-20">Media</th>
                            <th className="px-6 py-3.5 font-bold w-44">SKU Code</th>
                            <th className="px-6 py-3.5 font-bold">Options / Combos</th>
                            <th className="px-6 py-3.5 font-bold w-28">Price (৳)</th>
                            <th className="px-6 py-3.5 font-bold w-24">Stock</th>
                            <th className="px-6 py-3.5 font-bold text-right w-16">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {variants.map((v, index) => {
                            const isDuplicate = duplicateSkus.has(v.sku);
                            return (
                              <tr key={index} className="hover:bg-white/[0.01] transition-colors group">
                                
                              
                                <td className="px-6 py-3.5">
                                  <div className="relative w-10 h-10 rounded-lg bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-indigo-500 transition-colors cursor-pointer">
                                    {v.image ? (
                                      <img src={v.image} alt="Variant" className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-slate-600" />
                                    )}
                                    <input type="file" accept="image/*" onChange={(e) => handleVariantImageUpload(index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Upload variant image" />
                                  </div>
                                </td>
                                
                               
                                <td className="px-6 py-3.5">
                                  <div className="flex flex-col gap-1">
                                    <input type="text" value={v.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className={`w-full bg-transparent border-b border-transparent focus:border-indigo-500 hover:border-white/10 px-1 py-1 text-xs font-mono outline-none transition-colors ${
                                      isDuplicate || !v.sku ? 'text-red-400' : 'text-slate-300'
                                    }`} />
                                    {isDuplicate && (
                                      <span className="text-[8px] text-red-500 font-semibold uppercase tracking-wide flex items-center gap-0.5">
                                        <AlertTriangle className="w-2.5 h-2.5" /> Duplicate SKU
                                      </span>
                                    )}
                                    {!v.sku && (
                                      <span className="text-[8px] text-red-500 font-semibold uppercase tracking-wide flex items-center gap-0.5">
                                        <AlertTriangle className="w-2.5 h-2.5" /> SKU Required
                                      </span>
                                    )}
                                  </div>
                                </td>
                                
                              ``
                                <td className="px-6 py-3.5">
                                  <div className="flex flex-wrap gap-1.5">
                                    {attributes.length === 0 ? (
                                      <span className="text-[9px] text-slate-500 uppercase font-semibold px-2 py-0.5 bg-slate-950 rounded border border-white/5">Standard Option</span>
                                    ) : null}
                                    {attributes.map(attr => {
                                      if (!attr.name) return null;
                                      const currentVal = (v.attributes || {})[attr.name] || '';
                                      return (
                                        <div key={attr.name} className="flex items-center gap-1.5 bg-slate-950 border border-white/5 rounded px-2 py-0.5">
                                          <span className="text-[8px] text-slate-500 font-bold uppercase">{attr.name}:</span>
                                          <select value={currentVal} onChange={(e) => handleVariantAttributeChange(index, attr.name, e.target.value)} className="bg-transparent text-[9px] text-slate-350 outline-none w-16 appearance-none cursor-pointer">
                                            <option value="" className="bg-[#090e1a]">Select</option>
                                            {attr.values.map(val => <option key={val} value={val} className="bg-[#090e1a]">{val}</option>)}
                                          </select>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>
                                
                                {/* Price */}
                                <td className="px-6 py-3.5">
                                  <div className="flex items-center bg-slate-950 border border-white/10 rounded-lg px-2.5 focus-within:border-indigo-500 transition-colors">
                                    <span className="text-slate-500 text-[10px]">৳</span>
                                    <input type="number" value={v.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full bg-transparent px-1.5 py-1 text-xs text-slate-200 outline-none font-medium" />
                                  </div>
                                </td>
                                
                                {/* Stock */}
                                <td className="px-6 py-3.5">
                                  <input type="number" value={v.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors font-medium text-center" />
                                </td>
                                
                                {/* Delete action */}
                                <td className="px-6 py-3.5 text-right">
                                  <button type="button" onClick={() => handleRemoveVariant(index)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
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