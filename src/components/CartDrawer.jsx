import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
        gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
      });
      return () => {
        ctx.revert();
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(drawerRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: onClose
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3
    });
  };

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm opacity-0"
      />

      <div 
        ref={drawerRef}
        className="relative z-10 w-full max-w-md h-full bg-[#070b16] border-l border-white/5 shadow-2xl flex flex-col justify-between translate-x-full"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white font-display">Shopping Cart</h2>
            <span className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-xs text-slate-400 font-medium">
              {cartItems.length}
            </span>
          </div>

          <button 
            onClick={handleClose}
            className="rounded-full border border-white/5 bg-[#020617] p-2 text-slate-400 hover:text-white hover:border-white/15 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="rounded-full bg-white/[0.02] border border-white/5 p-5 text-slate-500 mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="text-base font-semibold text-slate-300">Your cart is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Add premium items from our catalog to get started.</p>
              <button 
                onClick={handleClose}
                className="mt-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 px-5 py-2 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const displayImage = item.variant.image || item.product.variants?.[0]?.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200';
              const variantName = item.variant.name || 'Default';
              const itemKey = `${item.product._id}-${variantName}-${idx}`;

              return (
                <div 
                  key={itemKey}
                  className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-3 transition-colors hover:bg-white/[0.02] group"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/5 bg-[#020617] relative">
                    <img 
                      src={displayImage} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover object-center" 
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 font-display group-hover:text-indigo-400 transition-colors">
                          {item.product.name}
                        </h4>
                        <button 
                          onClick={() => onRemoveItem(item)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider mt-0.5">
                        Option: {variantName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-white">৳ {(item.price * item.quantity).toLocaleString()}</span>
                      
                      <div className="flex items-center rounded-xl border border-white/5 bg-white/[0.02] p-1 scale-90 origin-right">
                        <button 
                          onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-white">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-[#050914] space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-bold text-white">৳ {subtotal.toLocaleString()}</span>
            </div>
            
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Shipping & Taxes</span>
              <span className="text-emerald-400 font-medium uppercase">Calculated at next step</span>
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                onClick={onClearCart}
                className="rounded-xl border border-white/5 bg-white/[0.02] px-4 text-xs font-semibold text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300 cursor-pointer"
              >
                Clear
              </button>
              
              <button 
                className="flex-1 group relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/35 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
