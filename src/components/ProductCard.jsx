import React from 'react';
import { useNavigate } from 'react-router';
import { Eye, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  
  const displayImage = product.coverImage || product.variants?.[0]?.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400';
  const variantCount = product.variants?.length || 0;

 
  const getUniqueColors = () => {
    const colors = new Set();
    product.variants?.forEach(v => {
      const attrs = v.attributes || v.attributeValues;
      if (!attrs) return;
      
      const getVal = (key) => {
        if (attrs instanceof Map) return attrs.get(key);
        if (typeof attrs.get === 'function') return attrs.get(key);
        return attrs[key];
      };
      
      const col = getVal('Color') || getVal('color');
      if (col) colors.add(col);
    });
    return Array.from(colors);
  };

  const colors = getUniqueColors();

  // Calculate total stock levels across variants
  const totalStock = product.variants && Array.isArray(product.variants)
    ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
    : (product.stock || 0);

  const getStockStatusTag = () => {
    if (totalStock === 0) {
      return (
        <span className="absolute top-2.5 right-2.5 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-red-400 backdrop-blur-md">
          Sold Out
        </span>
      );
    }
    if (totalStock <= 5) {
      return (
        <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md animate-pulse">
          Low Stock
        </span>
      );
    }
    return null;
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.04] bg-[#0b0f19]/30 p-4 transition-all duration-300 hover:border-indigo-500/25 hover:bg-[#0b0f19]/70 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] cursor-pointer"
    >
      <div>
        {/* Product Image Panel */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900/60 border border-white/5">
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          {product.category && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 border border-white/10 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md">
              {product.category}
            </span>
          )}
          {getStockStatusTag()}
        </div>

        {/* Text Details */}
        <div className="mt-4.5 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors duration-300 font-display leading-tight line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-[10px] text-slate-400 line-clamp-1 font-light leading-relaxed">
            {product.description}
          </p>

          {/* Option Indicators */}
          <div className="flex items-center justify-between mt-2 min-h-[16px]">
            {variantCount > 0 ? (
              <span className="text-[9px] text-indigo-400/90 font-bold uppercase tracking-wider block">
                {variantCount} {variantCount > 1 ? 'variants' : 'variant'}
              </span>
            ) : (
              <span className="text-[9px] text-slate-600 block uppercase font-medium">Standard</span>
            )}

            {/* Colors Circles */}
            {colors.length > 0 && (
              <div className="flex gap-1">
                {colors.map(col => (
                  <span 
                    key={col} 
                    className="w-2 h-2 rounded-full border border-white/10" 
                    style={{ backgroundColor: col.toLowerCase() }}
                    title={col}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <p className="text-xs font-bold text-white tracking-wide">৳ {product.basePrice.toLocaleString()}</p>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id || product.id}`);
            }}
            className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={totalStock <= 0}
            className={`rounded-full p-2.5 border transition-all duration-300 cursor-pointer ${
              totalStock <= 0
                ? 'border-white/5 bg-slate-900 text-slate-700 cursor-not-allowed shadow-none'
                : 'border-indigo-600/30 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]'
            }`}
            title={totalStock <= 0 ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;