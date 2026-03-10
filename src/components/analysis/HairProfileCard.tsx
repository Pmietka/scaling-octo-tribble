"use client";

import { motion } from "framer-motion";
import type { AnalysisResult } from "@/lib/types";
import FaceShapeOverlay from "./FaceShapeOverlay";

interface HairProfileCardProps {
  result: AnalysisResult;
  primaryPhoto?: string;
}

const FACE_SHAPE_DESCRIPTIONS: Record<string, string> = {
  oval: "The ideal face shape for most hairstyles",
  round: "Soft, curved features with similar width and length",
  square: "Strong jaw and forehead with angular features",
  heart: "Wider forehead tapering to a pointed chin",
  oblong: "Longer than wide with a narrow chin and forehead",
  diamond: "Narrow forehead and jaw with wide cheekbones",
};

const CONDITION_COLORS: Record<string, string> = {
  healthy: "text-sage-700 bg-sage/20",
  "slightly damaged": "text-terracotta-700 bg-terracotta/15",
  damaged: "text-orange-700 bg-orange-100",
  "severely damaged": "text-red-700 bg-red-100",
};

export default function HairProfileCard({
  result,
  primaryPhoto,
}: HairProfileCardProps) {
  const { face_analysis, hair_analysis, summary } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Photo + Face Shape */}
      {primaryPhoto && (
        <div className="relative h-64 bg-charcoal/5">
          <img
            src={primaryPhoto}
            alt="Your photo"
            className="w-full h-full object-cover object-top"
          />
          <div className="photo-overlay" />
          <FaceShapeOverlay faceAnalysis={face_analysis} />
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Summary */}
        {summary && (
          <p className="font-body text-sm text-charcoal/80 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Face Analysis */}
        <div className="space-y-2">
          <h3 className="font-display text-sm font-medium text-charcoal/60 uppercase tracking-wider">
            Face Analysis
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-cream rounded-xl p-3">
              <p className="text-xs font-body text-charcoal/50 mb-0.5">Shape</p>
              <p className="font-display text-lg capitalize text-charcoal">
                {face_analysis.shape}
              </p>
              <p className="text-xs font-body text-charcoal/60 mt-0.5">
                {FACE_SHAPE_DESCRIPTIONS[face_analysis.shape.toLowerCase()] || ""}
              </p>
            </div>
            <div className="bg-cream rounded-xl p-3 text-center w-20">
              <p className="text-xs font-body text-charcoal/50 mb-0.5">Match</p>
              <p className="font-display text-xl text-terracotta">
                {Math.round(face_analysis.confidence * 100)}%
              </p>
              <p className="text-xs font-body text-charcoal/60">confidence</p>
            </div>
          </div>

          {face_analysis.notable_features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {face_analysis.notable_features.slice(0, 4).map((feature, i) => (
                <span
                  key={i}
                  className="text-xs font-body px-2 py-0.5 bg-cream rounded-full text-charcoal/60"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hair Analysis */}
        <div className="space-y-2">
          <h3 className="font-display text-sm font-medium text-charcoal/60 uppercase tracking-wider">
            Hair Profile
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-cream rounded-xl p-3">
              <p className="text-xs font-body text-charcoal/50 mb-0.5">Type</p>
              <p className="font-body text-sm font-medium text-charcoal">
                {hair_analysis.type}
              </p>
              <p className="text-xs font-body text-charcoal/60 capitalize">
                {hair_analysis.texture}
              </p>
            </div>
            <div className="bg-cream rounded-xl p-3">
              <p className="text-xs font-body text-charcoal/50 mb-0.5">Density</p>
              <p className="font-body text-sm font-medium text-charcoal capitalize">
                {hair_analysis.density}
              </p>
            </div>
            <div className="bg-cream rounded-xl p-3 col-span-2">
              <p className="text-xs font-body text-charcoal/50 mb-0.5">Current Style</p>
              <p className="font-body text-sm text-charcoal">
                {hair_analysis.current_style}
              </p>
            </div>
          </div>

          {/* Condition badge */}
          <div className="flex items-center gap-2">
            <span
              className={`badge text-xs ${
                CONDITION_COLORS[hair_analysis.condition.toLowerCase()] ||
                "bg-cream text-charcoal/60"
              }`}
            >
              {hair_analysis.condition}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
