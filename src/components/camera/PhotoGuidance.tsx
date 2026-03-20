"use client";

import type { CapturedPhoto } from "@/lib/types";

interface PhotoGuidanceProps {
  angle: CapturedPhoto["angle"];
}

// SVG silhouettes for each angle
const FrontSilhouette = () => (
  <svg viewBox="0 0 200 280" className="w-32 h-44" fill="none">
    {/* Head */}
    <ellipse cx="100" cy="80" rx="45" ry="55" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Neck */}
    <rect x="88" y="130" width="24" height="25" rx="6" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Shoulders */}
    <path d="M40 180 Q55 155 88 155 L112 155 Q145 155 160 180 L170 200 L30 200 Z" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Crosshair */}
    <line x1="100" y1="55" x2="100" y2="105" stroke="rgba(196,117,75,0.8)" strokeWidth="1.5" />
    <line x1="72" y1="80" x2="128" y2="80" stroke="rgba(196,117,75,0.8)" strokeWidth="1.5" />
  </svg>
);

const SideSilhouette = () => (
  <svg viewBox="0 0 200 280" className="w-32 h-44" fill="none">
    {/* Head profile */}
    <path d="M70 35 Q95 30 115 45 Q135 60 135 90 Q135 120 115 135 Q95 150 70 145 Q50 140 45 120 Q40 100 50 70 Q60 40 70 35 Z" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Nose */}
    <path d="M118 75 L128 90 L118 95" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" />
    {/* Neck */}
    <rect x="62" y="145" width="22" height="22" rx="4" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Shoulder side view */}
    <path d="M45 190 Q55 167 75 167 Q95 167 95 185 L90 200 L40 200 Z" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
  </svg>
);

const BackSilhouette = () => (
  <svg viewBox="0 0 200 280" className="w-32 h-44" fill="none">
    {/* Head from back */}
    <ellipse cx="100" cy="80" rx="45" ry="55" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Hair indication */}
    <path d="M60 65 Q80 50 100 48 Q120 50 140 65" stroke="rgba(196,117,75,0.6)" strokeWidth="2" strokeDasharray="4 3" />
    <path d="M58 80 Q60 90 62 100" stroke="rgba(196,117,75,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
    <path d="M142 80 Q140 90 138 100" stroke="rgba(196,117,75,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
    {/* Neck */}
    <rect x="88" y="130" width="24" height="25" rx="6" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    {/* Shoulders */}
    <path d="M40 180 Q55 155 88 155 L112 155 Q145 155 160 180 L170 200 L30 200 Z" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
  </svg>
);

const GenericSilhouette = () => (
  <svg viewBox="0 0 200 280" className="w-32 h-44" fill="none">
    <ellipse cx="100" cy="80" rx="45" ry="55" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    <rect x="88" y="130" width="24" height="25" rx="6" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
    <path d="M40 180 Q55 155 88 155 L112 155 Q145 155 160 180 L170 200 L30 200 Z" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
  </svg>
);

const GUIDANCE_TEXT: Record<CapturedPhoto["angle"], string[]> = {
  front: [
    "Face the camera directly — full face visible",
    "Good lighting, no shadows on your face",
    "Needed to assess facial thirds & symmetry",
  ],
  side: [
    "Turn 90 degrees to one side",
    "Keep chin level — show full jaw profile",
    "Critical for jaw projection assessment",
  ],
  back: [
    "Turn completely away from camera",
    "Show the back of your head",
    "Let hair fall naturally",
  ],
  other: [
    "3/4 angle works great as a third photo",
    "High quality & well lit for best results",
    "Shows hair texture and facial structure",
  ],
};

export default function PhotoGuidance({ angle }: PhotoGuidanceProps) {
  const tips = GUIDANCE_TEXT[angle];

  const Silhouette =
    angle === "front"
      ? FrontSilhouette
      : angle === "side"
      ? SideSilhouette
      : angle === "back"
      ? BackSilhouette
      : GenericSilhouette;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none p-8">
      {/* Silhouette in center */}
      <div className="flex-1 flex items-center justify-center">
        <div className="camera-silhouette relative">
          <Silhouette />
        </div>
      </div>

      {/* Tips at bottom */}
      <div className="w-full max-w-xs space-y-1">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta flex-shrink-0" />
            <span className="text-white text-xs font-body">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
