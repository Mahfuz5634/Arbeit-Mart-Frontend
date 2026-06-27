import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Save, Edit3, X, Image as ImageIcon } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); 
  const [basePrice, setBasePrice] = useState(29);
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  
 
  const [imageUrl, setImageUrl] = useState('');
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
      setImageUrl(data.data.url); 
    } catch (error) {
      alert("Image upload failed!");
    } finally {
      setIsUploading(false);
    }
  };

  
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setCategory(product.category || '');
    setBasePrice(product.basePrice || 29);
    setAttributes(product.attributes || []);
    setVariants(product.variants || []);
    setImageUrl(product.variants?.[0]?.image || ''); /
    setIsEditing(true);
  };

  
  const handleAddNew = () => {
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setCategory('');
    setBasePrice(29);
    setAttributes([]);
    setVariants([]);
    setImageUrl('');
    setIsEditing(true);
  };

  /
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
      setVariants([{ sku, price: basePrice, stock: 10, attributeValues: {}, image: imageUrl }]);
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
        attributeValues: combo,
        image: imageUrl 
      };
    });

    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = field === 'sku' ? value : Number(value);
    setVariants(updated);
  };

  
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
   
    const productData = {
      name,
      description,
      category,
      basePrice,
      attributes: attributes.map(attr => ({ name: attr.name, values: attr.values })),
      variants
    };

    try {
      if (selectedProduct) {
     
        await fetch(`http://localhost:5000/api/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      } else {
        // নতুন তৈরি (POST)
        await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
      }
      
      fetchProducts(); /
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };


  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });
      fetchProducts(); 
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">Variable Product Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Manage products directly to MongoDB Database.</p>
        </div>
        {!isEditing && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="p-6 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl hover:border-indigo-500/30 transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
            
                <div className="h-40 w-full bg-[#020617] rounded-lg overflow-hidden border border-white/5">
                  <img 
                    src={product.variants?.[0]?.image || 'https://via.placeholder.com/400?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">{product.category}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => handleSelectProduct(product)} className="flex-1 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDeleteProduct(product._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSaveProduct} className="p-6 md:p-8 rounded-2xl border border-white/10 bg-[#070b16]/60 backdrop-blur-xl space-y-8 max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white">{selectedProduct ? `Editing: ${selectedProduct.name}` : 'New Product'}</h2>
            <button type="button" onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg bg-white/[0.02] text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Product Title</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Base Price ($)</label>
                <input type="number" required value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Product Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 h-[116px] resize-none" />
              </div>

            
              <div className="p-4 border border-dashed border-white/10 rounded-xl bg-[#020617] text-center relative">
                <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <ImageIcon className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                {isUploading ? (
                  <p className="text-xs text-indigo-400 animate-pulse">Uploading to ImgBB...</p>
                ) : imageUrl ? (
                  <p className="text-xs text-green-400 font-semibold">Image Uploaded Successfully! ✓</p>
                ) : (
                  <p className="text-xs text-slate-400">Click to upload product image</p>
                )}
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Attributes (Color, Size)</h3>
              <button type="button" onClick={handleAddAttribute} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-slate-200 rounded-lg text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" /> Add Attribute
              </button>
            </div>
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-4 items-end bg-[#020617]/50 p-4 rounded-xl border border-white/5">
                <input type="text" placeholder="Name (e.g. Size)" value={attr.name} onChange={(e) => handleAttributeChange(index, 'name', e.target.value)} className="w-1/3 bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
                <input type="text" placeholder="Values (S, M, L)" value={attr.valuesText || attr.values?.join(', ') || ''} onChange={(e) => handleAttributeChange(index, 'valuesText', e.target.value)} className="flex-1 bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
                <button type="button" onClick={() => handleRemoveAttribute(index)} className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Variants Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Variant Matrix</h3>
              <button type="button" onClick={generateVariantMatrix} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Generate Matrix
              </button>
            </div>
            <div className="overflow-x-auto border border-white/10 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#020617] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Attributes</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Price ($)</th>
                    <th className="py-2.5 px-4">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#020617]/20">
                  {variants.map((v, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 text-white">{Object.entries(v.attributeValues || {}).map(([k, val]) => `${k}: ${val}`).join(', ') || 'Default'}</td>
                      <td className="py-2 px-4"><input type="text" value={v.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="bg-[#020617] border border-white/10 rounded px-2 py-1 w-full text-white" /></td>
                      <td className="py-2 px-4"><input type="number" value={v.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="bg-[#020617] border border-white/10 rounded px-2 py-1 w-24 text-white" /></td>
                      <td className="py-2 px-4"><input type="number" value={v.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="bg-[#020617] border border-white/10 rounded px-2 py-1 w-20 text-white" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/[0.02] text-slate-300 rounded-xl text-sm transition-colors hover:bg-white/[0.05]">Cancel</button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors">
              <Save className="w-4 h-4" /> Save to Database
            </button>
          </div>
        </form>
      )}
    </div>
  );
}