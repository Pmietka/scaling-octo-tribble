"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StyleRecommendation } from "@/lib/types";
import StyleCard from "./StyleCard";
import { cn } from "@/lib/utils";

interface StyleCarouselProps {
  recommendations: StyleRecommendation[];
  userPhoto?: string;
}

export default function StyleCarousel({
  recommendations,
  userPhoto,
}: StyleCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const prev = () => {
    if (activeIndex > 0) goTo(activeIndex - 1);
  };

  const next = () => {
    if (activeIndex < recommendations.length - 1) goTo(activeIndex + 1);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="space-y-4">
      {/* Navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {recommendations.map((rec, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all",
              activeIndex === i
                ? "bg-charcoal text-white"
                : "bg-cream text-charcoal/60 hover:bg-charcoal/10"
            )}
          >
            {i + 1}. {rec.style_name.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
          >
            <StyleCard
              recommendation={recommendations[activeIndex]}
              index={activeIndex}
              userPhoto={userPhoto}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev/Next navigation */}
      {recommendations.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            className="w-10 h-10 rounded-full bg-white border border-charcoal/10 flex items-center justify-center text-charcoal/60 disabled:opacity-30 hover:border-charcoal/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {recommendations.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === activeIndex
                    ? "w-4 h-2 bg-terracotta"
                    : "w-2 h-2 bg-charcoal/20 hover:bg-charcoal/40"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={activeIndex === recommendations.length - 1}
            className="w-10 h-10 rounded-full bg-white border border-charcoal/10 flex items-center justify-center text-charcoal/60 disabled:opacity-30 hover:border-charcoal/20 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
