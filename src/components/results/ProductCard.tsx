"use client";

import { motion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";
import type { MatchedProduct } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

interface ProductCardProps {
  product: MatchedProduct;
  index?: number;
  onAffiliatClick?: (productId: string) => void;
}

const STAR_COUNT = 5;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(STAR_COUNT)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i < Math.floor(rating)
              ? "fill-terracotta text-terracotta"
              : i < rating
              ? "fill-terracotta/50 text-terracotta/50"
              : "fill-charcoal/10 text-charcoal/10"
          )}
        />
      ))}
      <span className="text-xs font-body text-charcoal/50 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductCard({
  product,
  index = 0,
  onAffiliatClick,
}: ProductCardProps) {
  const handleClick = () => {
    onAffiliatClick?.(product.id);
    window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card flex gap-3 p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream flex-shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-xs font-body text-charcoal/50 mb-0.5">
            {product.brand}
          </p>
          <p className="font-body text-sm font-medium text-charcoal leading-snug line-clamp-2">
            {product.name}
          </p>
          <div className="mt-1">
            <StarRating rating={product.rating} />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-base text-charcoal font-medium">
            {formatPrice(product.price)}
          </span>
          <button className="flex items-center gap-1 text-terracotta hover:text-terracotta-600 transition-colors">
            <span className="text-xs font-body font-medium">Buy</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
