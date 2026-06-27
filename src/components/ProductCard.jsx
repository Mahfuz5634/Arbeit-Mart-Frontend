import React from 'react';
import { useNavigate } from 'react-router';
import { Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const displayImage = product.variants?.[0]?.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400';
  const variantCount = product.variants?.length || 0;

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0b0f19]/40 p-4 transition-all duration-300 hover:border-indigo-500/20 hover:bg-[#0b0f19]/80 cursor-pointer"
    >
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900/60 border border-white/5">
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {product.category && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-md">
              {product.category}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors duration-300 font-display">
            {product.name}
          </h3>
          {variantCount > 0 && (
            <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider block">
              {variantCount} {variantCount > 1 ? 'variants' : 'variant'} available
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <p className="text-sm font-bold text-white">৳ {product.basePrice.toLocaleString()}</p>
        <button className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors duration-300">
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;