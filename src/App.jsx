import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

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

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/product`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the backend server. Please verify your connection.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleUpdateQuantity = (itemToUpdate, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemToUpdate);
      return;
    }
    const updated = cart.map(item => 
      (item.product._id === itemToUpdate.product._id && item.variant.sku === itemToUpdate.variant.sku)
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(updated);
  };

  const handleRemoveItem = (itemToRemove) => {
    const updated = cart.filter(item => 
      !(item.product._id === itemToRemove.product._id && item.variant.sku === itemToRemove.variant.sku)
    );
    saveCart(updated);
    addToast(`Removed ${itemToRemove.product.name} from cart.`, 'info');
  };

  const handleClearCart = () => {
    saveCart([]);
    addToast("Cleared shopping cart.", "info");
  };

  const handleAddToCartFromCard = (product) => {
    if (!product) return;
    
    // Select the first variant as the default option
    const matchedVariant = product.variants?.[0];
    if (!matchedVariant) {
      addToast("This product does not have any selectable variants.", "error");
      return;
    }

    const stock = matchedVariant.stock ?? 0;
    if (stock <= 0) {
      addToast("This item is currently out of stock.", "error");
      return;
    }

    const newCart = [...cart];
    const existingIdx = newCart.findIndex(item => 
      item.product._id === product._id && item.variant.sku === matchedVariant.sku
    );

    if (existingIdx > -1) {
      const newQty = newCart[existingIdx].quantity + 1;
      if (newQty > stock) {
        addToast(`Cannot add items. Only ${stock} units available.`, 'error');
        return;
      }
      newCart[existingIdx].quantity = newQty;
    } else {
      newCart.push({
        product,
        variant: matchedVariant,
        quantity: 1,
        price: Number(matchedVariant.price || product.basePrice || 0)
      });
    }

    saveCart(newCart);
    addToast(`Added ${product.name} to cart.`);
  };

  const categories = ['All', 'Electronics', 'Apparel', 'Wearables', 'Workspace'];
  
  const filteredProducts = products.filter(product => {
    const nameMatches = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const descMatches = product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = nameMatches || descMatches;
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    const price = product.basePrice || 0;
    const matchesMinPrice = minPriceInput === '' || price >= Number(minPriceInput);
    const matchesMaxPrice = maxPriceInput === '' || price <= Number(maxPriceInput);
    
    const totalStock = product.variants && Array.isArray(product.variants)
      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
      : (product.stock || 0);
    const matchesStock = !inStockOnly || totalStock > 0;
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || minPriceInput !== '' || maxPriceInput !== '' || inStockOnly || sortBy !== 'featured';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased flex flex-col justify-between">
      <div>
        <Navbar 
          cartCount={totalCartCount}
          onCartClick={() => setIsCartOpen(true)}
          floating={true}
        />
        <Hero />

        <main id="catalog" className="mx-auto max-w-7xl px-4 sm:px-6 pb-24 pt-16">
          <div className="flex flex-col gap-6 border-b border-white/5 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-display">Product Catalog</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Select an item to view variable options & specifications.</p>
              </div>

              {/* Reset active filters count badge */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="self-start md:self-auto text-xs text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Reset Active Filters</span>
                </button>
              )}
            </div>

            {/* Filter and Search Bar Container */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
              {/* Category selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-2 px-2 lg:mx-0 lg:px-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4.5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/[0.05] hover:text-slate-200 hover:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Live Search */}
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium gear..."
                    className="w-full rounded-full bg-white/[0.03] border border-white/5 py-2.5 pl-10 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:bg-[#090d1f] focus:border-indigo-500/50 focus:outline-none transition-all duration-300"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-full px-3 py-1 w-full sm:w-auto">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 mr-2 ml-1" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-0 text-xs text-slate-300 focus:outline-none py-1.5 pr-6 cursor-pointer font-medium appearance-none w-full"
                  >
                    <option value="featured" className="bg-[#090e1a]">Sort: Featured</option>
                    <option value="price-asc" className="bg-[#090e1a]">Price: Low to High</option>
                    <option value="price-desc" className="bg-[#090e1a]">Price: High to Low</option>
                    <option value="name-asc" className="bg-[#090e1a]">Name: A-Z</option>
                    <option value="name-desc" className="bg-[#090e1a]">Name: Z-A</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none text-slate-500 text-[10px]">▼</div>
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold border transition-all duration-300 cursor-pointer w-full sm:w-auto ${
                    showFilters || minPriceInput || maxPriceInput || inStockOnly
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 hover:border-white/10'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                  {(minPriceInput || maxPriceInput || inStockOnly) && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable filters panel */}
            {showFilters && (
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
                {/* Price range filter */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range (৳)</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/5 p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                    <span className="text-slate-600 text-xs">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/5 p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Stock availability filter */}
                <div className="space-y-2.5 flex flex-col justify-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Availability</h4>
                  <label className="relative flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/5 rounded-full peer peer-focus:ring-1 peer-focus:ring-indigo-500/40 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-indigo-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-950 border border-white/10 peer-checked:border-indigo-500/50" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">In Stock Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-32 text-center text-slate-500 text-sm">
              No products match your filters. Try resetting search query or price range.
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-500 mt-4 mb-2 font-medium">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((prod) => (
                  <ProductCard 
                    key={prod._id} 
                    product={prod}
                    onAddToCart={handleAddToCartFromCard}
                  />
                ))}
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
}