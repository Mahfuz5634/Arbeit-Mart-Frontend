import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import { ArrowLeft, ShoppingCart, Check, Info, Minus, Plus, AlertTriangle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
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
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('arbeit-cart', JSON.stringify(newCart));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/product/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch product (Status: ${res.status})`);
        }
        const data = await res.json();
        
        if (data) {
          setProduct(data);
         
          if (data.variants && data.variants.length > 0 && data.variants[0]) {
            setSelectedAttributes(data.variants[0].attributes || data.variants[0].attributeValues || {});
          } else if (data.attributes && Array.isArray(data.attributes) && data.attributes.length > 0) {
            const initial = {};
            data.attributes.forEach(attr => {
              if (attr && Array.isArray(attr.values) && attr.values.length > 0) {
                initial[attr.name] = attr.values[0];
              }
            });
            setSelectedAttributes(initial);
          }
        } else {
          throw new Error("No product data received");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load product details from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getMatchedVariant = () => {
    if (!product || !product.variants || !Array.isArray(product.variants)) return null;
    return product.variants.find(variant => {
      if (!variant) return false;
      const attrs = variant.attributes || variant.attributeValues;
      if (!attrs || typeof attrs !== 'object') return false;
      return Object.entries(selectedAttributes || {}).every(([key, val]) => {
        const variantAttrVal = attrs instanceof Map 
          ? attrs.get(key) 
          : attrs[key];
        return variantAttrVal === val;
      });
    });
  };

  const matchedVariant = getMatchedVariant();
  
  const displayImage = matchedVariant?.image || product?.coverImage || product?.variants?.[0]?.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600';
  const priceVal = Number(matchedVariant?.price || product?.basePrice || 0);
  const basePriceVal = Number(product?.basePrice || 0);
  const sku = matchedVariant?.sku || 'N/A';
  const stock = matchedVariant ? (matchedVariant.stock ?? 0) : 0;
  const isOutOfStock = stock <= 0;

  const handleSelectAttribute = (attrName, value) => {
    setSelectedAttributes(prev => {
      const updated = { ...prev, [attrName]: value };
      
      if (product.variants) {
        const hasMatch = product.variants.some(v => {
          const attrs = v.attributes || v.attributeValues;
          const vAttrVal = attrs instanceof Map ? attrs.get(attrName) : attrs?.[attrName];
          return vAttrVal === value;
        });

        if (hasMatch) {
          const matchingVariant = product.variants.find(v => {
            const attrs = v.attributes || v.attributeValues;
            const vAttrVal = attrs instanceof Map ? attrs.get(attrName) : attrs?.[attrName];
            return vAttrVal === value;
          });
          const matchingAttrs = matchingVariant?.attributes || matchingVariant?.attributeValues;
          if (matchingVariant && matchingAttrs) {
            return { ...matchingAttrs, [attrName]: value };
          }
        }
      }
      return updated;
    });
  };

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      if (quantity < stock) {
        setQuantity(prev => prev + 1);
      } else {
        addToast(`Cannot add more items. Only ${stock} units in stock.`, 'error');
      }
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!matchedVariant) {
      addToast("Please select a valid options combination.", "error");
      return;
    }
    if (isOutOfStock) {
      addToast("This item combination is currently out of stock.", "error");
      return;
    }

    const newCart = [...cart];
    const existingIdx = newCart.findIndex(item => 
      item.product._id === product._id && item.variant.sku === matchedVariant.sku
    );

    if (existingIdx > -1) {
      const newQty = newCart[existingIdx].quantity + quantity;
      if (newQty > stock) {
        addToast(`Cannot add items. Total in cart (${newQty}) exceeds stock (${stock}).`, 'error');
        return;
      }
      newCart[existingIdx].quantity = newQty;
    } else {
      newCart.push({
        product,
        variant: matchedVariant,
        quantity,
        price: priceVal
      });
    }

    saveCart(newCart);
    addToast(`Added ${quantity}x ${product.name} (${matchedVariant.name || sku}) to cart.`);
  };

  const handleUpdateQuantity = (itemToUpdate, newQuantity) => {
    const updatedCart = cart.map(item => 
      (item.product._id === itemToUpdate.product._id && item.variant.sku === itemToUpdate.variant.sku)
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(updatedCart);
  };

  const handleRemoveItem = (itemToRemove) => {
    const updatedCart = cart.filter(item => 
      !(item.product._id === itemToRemove.product._id && item.variant.sku === itemToRemove.variant.sku)
    );
    saveCart(updatedCart);
    addToast(`Removed ${itemToRemove.product.name} from cart.`, 'info');
  };

  const handleClearCart = () => {
    saveCart([]);
    addToast("Cleared shopping cart.", "info");
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased flex flex-col justify-between">
      <div>
        <Navbar 
          searchQuery="" 
          setSearchQuery={() => {}} 
          cartCount={totalCartCount}
          onCartClick={() => setIsCartOpen(true)}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to catalog</span>
          </Link>

          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="my-16 max-w-lg mx-auto rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
              <h3 className="text-base font-bold text-white font-display">Could not load product</h3>
              <p className="mt-2 text-xs text-red-200/70 leading-relaxed">{error}</p>
              <Link 
                to="/" 
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                Return to Catalog
              </Link>
            </div>
          ) : !product ? (
            <div className="my-20 text-center text-slate-500">
              No product found.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#070b16] shadow-xl flex items-center justify-center">
                  <img 
                    src={displayImage} 
                    alt={product.name} 
                    className="h-full w-full object-cover object-center transition-all duration-500" 
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-slate-950/80 border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur-md">
                    {product.category}
                  </span>
                </div>

                {product.variants && Array.isArray(product.variants) && product.variants.filter(Boolean).length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {product.variants.filter(Boolean).map((v, idx) => {
                      const rawAttrs = v.attributes || v.attributeValues || {};
                      const attrs = (typeof rawAttrs === 'object' && rawAttrs !== null) ? rawAttrs : {};
                      const isSelected = Object.entries(attrs).every(
                        ([key, val]) => selectedAttributes[key] === val
                      );
                      return (
                        <button
                          key={v.sku + idx}
                          onClick={() => setSelectedAttributes(attrs)}
                          className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-200 ${
                            isSelected 
                              ? 'border-indigo-500 ring-2 ring-indigo-500/25' 
                              : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <img src={v.image} alt={v.name || product.name} className="h-full w-full object-cover object-center" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">SKU: {sku}</span>
                    <span className="text-slate-600">•</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                      isOutOfStock 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : `${stock} Units in stock`}
                    </span>
                  </div>

                  <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white font-display leading-tight">{product.name}</h1>
                  
                  <div className="mt-3.5 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">৳ {priceVal.toLocaleString()}</span>
                    {matchedVariant && priceVal !== basePriceVal && (
                      <span className="text-sm text-slate-500 line-through">৳ {basePriceVal.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{product.description}</p>
                  </div>

                  {product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0 && (
                    <div className="mt-6 space-y-5 border-t border-white/5 pt-5">
                      {product.attributes.filter(Boolean).map((attr) => (
                        <div key={attr.name}>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {attr.name}
                          </label>
                          <div className="mt-2.5 flex flex-wrap gap-2.5">
                            {Array.isArray(attr.values) && attr.values.map((val) => {
                              const isSelected = selectedAttributes[attr.name] === val;
                              return (
                                <button
                                  key={val}
                                  onClick={() => handleSelectAttribute(attr.name, val)}
                                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium border transition-all duration-300 ${
                                    isSelected
                                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                                  <span>{val}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-10 border-t border-white/5 pt-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center justify-between sm:justify-start rounded-2xl border border-white/5 bg-white/[0.02] p-1.5 self-start w-full sm:w-auto">
                      <button 
                        onClick={() => handleQuantityChange('dec')}
                        className="rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                        disabled={quantity <= 1 || isOutOfStock}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-white">{isOutOfStock ? 0 : quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange('inc')}
                        className="rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                        disabled={isOutOfStock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || !matchedVariant}
                      className={`flex-1 flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 cursor-pointer ${
                        isOutOfStock || !matchedVariant
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
                          : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/35 active:scale-98'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>

                  
                </div>

              </div>

            </div>
          )}
        </main>
      </div>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <Toast 
        toasts={toasts}
        removeToast={removeToast}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;
