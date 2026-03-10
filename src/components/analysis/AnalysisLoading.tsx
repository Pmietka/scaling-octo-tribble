"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_STAGES = [
  { progress: 15, message: "Analyzing your photos..." },
  { progress: 30, message: "Identifying face shape..." },
  { progress: 50, message: "Assessing hair type and texture..." },
  { progress: 65, message: "Reviewing hair condition..." },
  { progress: 80, message: "Crafting style recommendations..." },
  { progress: 92, message: "Matching products to your hair..." },
  { progress: 99, message: "Almost ready..." },
];

// Hair strand animation SVG
function HairStrand() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24"
      fill="none"
    >
      {/* Rotating outer ring */}
      <motion.circle
        cx="60"
        cy="60"
        r="50"
        stroke="rgba(196,117,75,0.15)"
        strokeWidth="2"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <motion.circle
        cx="60"
        cy="60"
        r="50"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeDasharray="30 290"
        strokeLinecap="round"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "60px 60px" }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c4754b" />
          <stop offset="100%" stopColor="rgba(196,117,75,0)" />
        </linearGradient>
      </defs>

      {/* Hair strand curves in center */}
      <motion.path
        d="M60 25 C70 35 75 45 70 55 C65 65 55 70 55 80 C55 90 60 95 60 95"
        stroke="#c4754b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{
          d: [
            "M60 25 C70 35 75 45 70 55 C65 65 55 70 55 80 C55 90 60 95 60 95",
            "M60 25 C50 35 45 45 50 55 C55 65 65 70 65 80 C65 90 60 95 60 95",
            "M60 25 C70 35 75 45 70 55 C65 65 55 70 55 80 C55 90 60 95 60 95",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M55 28 C65 38 68 48 64 57 C60 67 52 71 52 81 C52 88 57 92 57 92"
        stroke="rgba(196,117,75,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        animate={{
          d: [
            "M55 28 C65 38 68 48 64 57 C60 67 52 71 52 81 C52 88 57 92 57 92",
            "M55 28 C45 38 42 48 46 57 C50 67 58 71 58 81 C58 88 53 92 53 92",
            "M55 28 C65 38 68 48 64 57 C60 67 52 71 52 81 C52 88 57 92 57 92",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.path
        d="M65 28 C55 38 52 48 56 57 C60 67 68 71 68 81 C68 88 63 92 63 92"
        stroke="rgba(196,117,75,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        animate={{
          d: [
            "M65 28 C55 38 52 48 56 57 C60 67 68 71 68 81 C68 88 63 92 63 92",
            "M65 28 C75 38 78 48 74 57 C70 67 62 71 62 81 C62 88 67 92 67 92",
            "M65 28 C55 38 52 48 56 57 C60 67 68 71 68 81 C68 88 63 92 63 92",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
    </svg>
  );
}

export default function AnalysisLoading() {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Advance through loading stages
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < LOADING_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const targetProgress = LOADING_STAGES[stageIndex].progress;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) return Math.min(prev + 1, targetProgress);
        return prev;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [stageIndex]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-8">
        {/* Animation */}
        <div className="flex justify-center">
          <HairStrand />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl text-charcoal">
            Analyzing Your Hair
          </h2>
          <p className="font-body text-sm text-charcoal/60">
            Our AI stylist is crafting personalized recommendations just for you
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="w-full h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-terracotta rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="font-body text-sm text-charcoal/60"
            >
              {LOADING_STAGES[stageIndex].message}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Fun facts while loading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="bg-white rounded-2xl p-4 text-left"
        >
          <p className="text-xs font-body text-charcoal/50 mb-1">Did you know?</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-body text-charcoal/70"
            >
              {[
                "The average person has between 80,000 and 120,000 strands of hair on their head.",
                "Hair grows about 6 inches per year on average.",
                "Your face shape is one of the most important factors in choosing a flattering haircut.",
                "The hair strand structure is determined by the shape of the follicle.",
                "Humidity affects hair because water molecules break hydrogen bonds in the hair shaft.",
              ][stageIndex % 5]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
