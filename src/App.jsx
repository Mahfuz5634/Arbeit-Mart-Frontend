import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { Search, X } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
        const res = await fetch('http://localhost:5000/api/product');
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

  const categories = ['All', 'Electronics', 'Apparel', 'Wearables', 'Workspace'];
  
  const filteredProducts = products.filter(product => {
    const nameMatches = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const descMatches = product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = nameMatches || descMatches;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Arbeit Lab Inventory</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-display">Product Catalog</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Select an item to view variable options & specifications.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search premium gear..."
                  className="w-full rounded-full bg-white/[0.03] border border-white/5 py-2 pl-10 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:bg-[#090d1f] focus:border-indigo-500/50 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4.5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/[0.05] hover:text-slate-200 hover:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
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
              No products found. Please verify backend database.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((prod) => (
                <ProductCard 
                  key={prod._id} 
                  product={prod}
                />
              ))}
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