"use client";

import { motion } from "framer-motion";
import type { AnalysisResult, FacialPrincipleAssessment } from "@/lib/types";

interface HairProfileCardProps {
  result: AnalysisResult;
  primaryPhoto?: string;
}

const PRINCIPLE_LABELS: Record<string, string> = {
  facial_thirds: "Facial Thirds",
  symmetry: "Symmetry",
  vertical_length: "Vertical Length",
  jaw_projection: "Jaw Projection",
};

const RATING_LABELS: Record<string, string> = {
  small_upper: "Small Upper Third",
  large_upper: "Large Upper Third",
  balanced: "Balanced",
  highly_symmetrical: "Highly Symmetrical",
  moderately_symmetrical: "Moderately Symmetrical",
  asymmetrical: "Asymmetrical",
  long: "Long",
  short: "Short",
  angular_projected: "Angular & Projected",
  soft_rounded: "Soft & Rounded",
  moderate: "Moderate",
};

const RATING_COLORS: Record<string, string> = {
  balanced: "bg-sage/20 text-sage-700",
  highly_symmetrical: "bg-sage/20 text-sage-700",
  moderate: "bg-sage/20 text-sage-700",
  moderately_symmetrical: "bg-terracotta/15 text-terracotta-700",
  small_upper: "bg-terracotta/15 text-terracotta-700",
  large_upper: "bg-terracotta/15 text-terracotta-700",
  long: "bg-terracotta/15 text-terracotta-700",
  short: "bg-terracotta/15 text-terracotta-700",
  asymmetrical: "bg-charcoal/10 text-charcoal/70",
  angular_projected: "bg-sage/20 text-sage-700",
  soft_rounded: "bg-charcoal/10 text-charcoal/70",
};

const CONDITION_COLORS: Record<string, string> = {
  healthy: "text-sage-700 bg-sage/20",
  "slightly damaged": "text-terracotta-700 bg-terracotta/15",
  damaged: "text-orange-700 bg-orange-100",
  "severely damaged": "text-red-700 bg-red-100",
};

const PRINCIPLE_ICONS: Record<string, string> = {
  facial_thirds: "⅓",
  symmetry: "⟺",
  vertical_length: "↕",
  jaw_projection: "◇",
};

function FacialFeatureCard({
  principleKey,
  assessment,
}: {
  principleKey: string;
  assessment: FacialPrincipleAssessment<string>;
}) {
  const ratingColor = RATING_COLORS[assessment.rating] || "bg-cream text-charcoal/60";
  return (
    <div className="bg-cream rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-charcoal/40">{PRINCIPLE_ICONS[principleKey]}</span>
          <p className="text-xs font-body font-medium text-charcoal/60">
            {PRINCIPLE_LABELS[principleKey]}
          </p>
        </div>
      </div>
      <span className={`inline-block text-xs font-body font-medium px-2 py-0.5 rounded-full ${ratingColor}`}>
        {RATING_LABELS[assessment.rating] || assessment.rating}
      </span>
      <p className="text-xs font-body text-charcoal/70 leading-relaxed">
        {assessment.observation}
      </p>
      <div className="border-t border-charcoal/8 pt-2">
        <p className="text-xs font-body text-charcoal/50 italic leading-relaxed">
          {assessment.style_implication}
        </p>
      </div>
    </div>
  );
}

// Legacy face shape descriptions for old records
const FACE_SHAPE_DESCRIPTIONS: Record<string, string> = {
  oval: "The ideal face shape for most hairstyles",
  round: "Soft, curved features with similar width and length",
  square: "Strong jaw and forehead with angular features",
  heart: "Wider forehead tapering to a pointed chin",
  oblong: "Longer than wide with a narrow chin and forehead",
  diamond: "Narrow forehead and jaw with wide cheekbones",
};

export default function HairProfileCard({
  result,
  primaryPhoto,
}: HairProfileCardProps) {
  const { facial_feature_analysis, face_analysis, hair_analysis, summary } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Photo */}
      {primaryPhoto && (
        <div className="relative h-64 bg-charcoal/5">
          <img
            src={primaryPhoto}
            alt="Your photo"
            className="w-full h-full object-cover object-top"
          />
          <div className="photo-overlay" />
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Summary */}
        {summary && (
          <p className="font-body text-sm text-charcoal/80 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Facial Feature Analysis (new 4-principle) */}
        {facial_feature_analysis ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-medium text-charcoal/60 uppercase tracking-wider">
                Facial Feature Analysis
              </h3>
              <span className="text-xs font-body text-charcoal/40">
                {Math.round(facial_feature_analysis.overall_confidence * 100)}% confidence
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FacialFeatureCard
                principleKey="facial_thirds"
                assessment={facial_feature_analysis.facial_thirds}
              />
              <FacialFeatureCard
                principleKey="symmetry"
                assessment={facial_feature_analysis.symmetry}
              />
              <FacialFeatureCard
                principleKey="vertical_length"
                assessment={facial_feature_analysis.vertical_length}
              />
              <FacialFeatureCard
                principleKey="jaw_projection"
                assessment={facial_feature_analysis.jaw_projection}
              />
            </div>
          </div>
        ) : face_analysis ? (
          // Legacy fallback for old records
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
        ) : null}

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
