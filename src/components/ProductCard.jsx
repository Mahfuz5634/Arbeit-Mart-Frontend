import React from 'react';
import { useNavigate } from 'react-router';
import { Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const displayImage = product.variants?.[0]?.image || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400';

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0b0f19]/40 p-4 transition-all duration-500 hover:border-indigo-500/20 hover:bg-[#0b0f19]/80 hover:shadow-[0_8px_30px_rgb(99,102,241,0.06)] cursor-pointer"
    >
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900/60 border border-white/5">
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 border border-white/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-md">
            {product.category}
          </span>

          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-opacity duration-300 backdrop-blur-[2px] group-hover:opacity-100">
            <button className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-lg hover:scale-105 transition-transform">
              <Eye className="h-3.5 w-3.5" />
              <span>View Details</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-300 font-display">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-white/5 pt-4">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">Starting At</span>
          <p className="text-base font-bold text-white mt-0.5">৳ {product.basePrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;