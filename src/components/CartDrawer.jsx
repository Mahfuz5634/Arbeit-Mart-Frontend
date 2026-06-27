import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const navigate = useNavigate();
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
        className="relative z-10 w-full max-w-sm h-full bg-[#070b16] border-l border-white/5 flex flex-col justify-between translate-x-full"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4.5 h-4.5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cart</h2>
            <span className="text-xs text-slate-500">({cartItems.length})</span>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-500">Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const displayImage = item.variant.image || item.product.variants?.[0]?.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200';
              const variantName = item.variant.name || 'Default';
              const itemKey = `${item.product._id}-${variantName}-${idx}`;

              return (
                <div key={itemKey} className="flex gap-4 items-center justify-between py-3 border-b border-white/5">
                  <img src={displayImage} alt={item.product.name} className="h-12 w-12 rounded object-cover border border-white/5 bg-[#020617]" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.name}</h4>
                    <span className="text-[10px] text-slate-500">{variantName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdateQuantity(item, item.quantity - 1)} className="p-1 text-slate-500 hover:text-white" disabled={item.quantity <= 1}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs text-slate-300 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item, item.quantity + 1)} className="p-1 text-slate-500 hover:text-white">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">৳ {item.price * item.quantity}</span>
                  </div>
                  <button onClick={() => onRemoveItem(item)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-[#050914] space-y-4">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Total</span>
              <span className="text-white">৳ {subtotal.toLocaleString()}</span>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Guest checkout active. No registration required to order.
            </p>
            
            <div className="flex gap-2">
              <button onClick={onClearCart} className="w-1/3 py-2 bg-white/[0.02] border border-white/5 text-slate-400 hover:text-red-400 text-xs rounded-xl transition-all">
                Clear
              </button>
              <button 
                onClick={() => {
                  handleClose();
                  navigate('/checkout');
                }}
                className="flex-1 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-all text-center"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
