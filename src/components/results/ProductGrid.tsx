"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MatchedProduct, ProductRecommendation } from "@/lib/types";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  matchedProducts: Record<string, MatchedProduct[]>;
  aiRecommendations: ProductRecommendation[];
  onAffiliateClick?: (productId: string) => void;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; emoji: string; order: number }
> = {
  shampoo: { label: "Cleansing", emoji: "🚿", order: 1 },
  conditioner: { label: "Conditioning", emoji: "💧", order: 2 },
  styling: { label: "Styling", emoji: "✨", order: 3 },
  treatment: { label: "Treatment", emoji: "💊", order: 4 },
  tool: { label: "Tools", emoji: "🛠", order: 5 },
};

export default function ProductGrid({
  matchedProducts,
  aiRecommendations,
  onAffiliateClick,
}: ProductGridProps) {
  const categories = Object.keys(matchedProducts).sort(
    (a, b) =>
      (CATEGORY_CONFIG[a]?.order || 99) - (CATEGORY_CONFIG[b]?.order || 99)
  );

  const [activeCategory, setActiveCategory] = useState(categories[0] || "");

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-charcoal/40 font-body text-sm">
        No product recommendations available
      </div>
    );
  }

  const aiRec = aiRecommendations.find(
    (r) => r.category.toLowerCase() === activeCategory
  );
  const products = matchedProducts[activeCategory] || [];

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {categories.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-body font-medium transition-all",
                activeCategory === cat
                  ? "bg-charcoal text-white"
                  : "bg-white text-charcoal/60 hover:bg-cream border border-charcoal/10"
              )}
            >
              <span>{config?.emoji}</span>
              <span>{config?.label || cat}</span>
            </button>
          );
        })}
      </div>

      {/* AI recommendation context */}
      {aiRec && (
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-terracotta/8 rounded-xl p-4 border border-terracotta/15"
        >
          <p className="text-xs font-body font-medium text-terracotta mb-1">
            What to look for
          </p>
          <p className="text-sm font-body text-charcoal/70">
            {aiRec.what_to_look_for}
          </p>

          {aiRec.key_ingredients.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs font-body text-charcoal/50">
                Key ingredients:
              </span>
              {aiRec.key_ingredients.slice(0, 4).map((ing, i) => (
                <span
                  key={i}
                  className="text-xs font-body px-2 py-0.5 bg-white rounded-full text-terracotta-700"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          {aiRec.avoid_ingredients.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-xs font-body text-charcoal/50">
                Avoid:
              </span>
              {aiRec.avoid_ingredients.slice(0, 3).map((ing, i) => (
                <span
                  key={i}
                  className="text-xs font-body px-2 py-0.5 bg-red-50 rounded-full text-red-600"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          {aiRec.usage_tip && (
            <p className="mt-2 text-xs font-body text-charcoal/60 italic">
              Tip: {aiRec.usage_tip}
            </p>
          )}
        </motion.div>
      )}

      {/* Products */}
      <motion.div
        key={`products_${activeCategory}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        {products.length > 0 ? (
          products.map((product, i) => (
            <div key={product.id}>
              <ProductCard
                product={product}
                index={i}
                onAffiliatClick={onAffiliateClick}
              />
              {product.match_reason && (
                <p className="text-xs font-body text-charcoal/40 px-4 pt-1 pb-2">
                  {product.match_reason}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-charcoal/40 font-body text-sm">
            No matching products found in this category
          </div>
        )}
      </motion.div>
    </div>
  );
}
