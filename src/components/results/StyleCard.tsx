"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Scissors, Search } from "lucide-react";
import type { StyleRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils";
import BarberExport from "./BarberExport";

interface StyleCardProps {
  recommendation: StyleRecommendation;
  index: number;
  userPhoto?: string;
}

const MAINTENANCE_CONFIG = {
  low: { label: "Low maintenance", className: "badge-low", dots: 1 },
  medium: { label: "Medium maintenance", className: "badge-medium", dots: 2 },
  high: { label: "High maintenance", className: "badge-high", dots: 3 },
};

export default function StyleCard({
  recommendation,
  index,
  userPhoto,
}: StyleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBarberExport, setShowBarberExport] = useState(false);

  const maintenance = MAINTENANCE_CONFIG[recommendation.maintenance_level] ||
    MAINTENANCE_CONFIG.medium;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="card"
      >
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta text-xs font-body font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className={`badge ${maintenance.className} flex-shrink-0`}>
                  {"•".repeat(maintenance.dots)} {maintenance.label}
                </span>
              </div>
              <h3 className="font-display text-xl text-charcoal leading-tight">
                {recommendation.style_name}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 pt-3">
          <p className="font-body text-sm text-charcoal/70 leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        {/* Why it works */}
        <div className="mx-5 mt-3 bg-sage/10 rounded-xl p-3">
          <p className="text-xs font-body font-medium text-sage-700 mb-1">
            Why this works for you
          </p>
          <p className="font-body text-sm text-charcoal/70 leading-snug">
            {recommendation.why_it_works}
          </p>
        </div>

        {/* Search keywords */}
        {recommendation.search_keywords.length > 0 && (
          <div className="px-5 pt-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Search className="w-3.5 h-3.5 text-charcoal/40 flex-shrink-0" />
              {recommendation.search_keywords.slice(0, 4).map((kw, i) => (
                <span
                  key={i}
                  className="text-xs font-body px-2 py-0.5 bg-cream rounded-full text-charcoal/60"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable barber instructions */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 pt-3 pb-2 flex items-center justify-between text-left hover:bg-cream/50 transition-colors"
        >
          <span className="text-sm font-body font-medium text-charcoal/60 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5" />
            Barber instructions
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-charcoal/40 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4">
                <div className="bg-charcoal/5 rounded-xl p-3">
                  <p className="font-body text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                    {recommendation.barber_instructions}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer action */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={() => setShowBarberExport(true)}
            className="w-full btn-primary text-center"
          >
            Show My Barber
          </button>
        </div>
      </motion.div>

      {/* Barber Export Modal */}
      <AnimatePresence>
        {showBarberExport && (
          <BarberExport
            recommendation={recommendation}
            userPhoto={userPhoto}
            onClose={() => setShowBarberExport(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
