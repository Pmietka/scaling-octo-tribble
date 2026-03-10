"use client";

import type { FaceAnalysis } from "@/lib/types";

interface FaceShapeOverlayProps {
  faceAnalysis: FaceAnalysis;
  className?: string;
}

// SVG paths for each face shape (normalized to 100x130 viewBox)
const FACE_SHAPES: Record<string, string> = {
  oval: "M50 10 C70 10 85 25 88 50 C91 75 85 100 70 115 C60 122 40 122 30 115 C15 100 9 75 12 50 C15 25 30 10 50 10 Z",
  round: "M50 10 C72 10 88 26 88 50 C88 74 72 90 50 90 C28 90 12 74 12 50 C12 26 28 10 50 10 Z",
  square: "M20 15 C28 10 72 10 80 15 C87 20 90 35 90 55 C90 75 87 90 80 105 C73 115 27 115 20 105 C13 90 10 75 10 55 C10 35 13 20 20 15 Z",
  heart: "M50 20 C45 10 30 5 20 15 C10 25 12 45 25 60 C35 72 50 90 50 90 C50 90 65 72 75 60 C88 45 90 25 80 15 C70 5 55 10 50 20 Z",
  oblong: "M50 5 C65 5 80 18 83 40 C86 62 83 90 78 108 C72 120 28 120 22 108 C17 90 14 62 17 40 C20 18 35 5 50 5 Z",
  diamond: "M50 5 L80 50 L50 95 L20 50 Z",
};

const SHAPE_COLORS: Record<string, string> = {
  oval: "rgba(135,168,120,0.5)",
  round: "rgba(196,117,75,0.5)",
  square: "rgba(26,26,46,0.4)",
  heart: "rgba(196,117,75,0.5)",
  oblong: "rgba(135,168,120,0.5)",
  diamond: "rgba(196,117,75,0.5)",
};

export default function FaceShapeOverlay({
  faceAnalysis,
  className = "",
}: FaceShapeOverlayProps) {
  const shape = faceAnalysis.shape.toLowerCase();
  const path = FACE_SHAPES[shape] || FACE_SHAPES.oval;
  const color = SHAPE_COLORS[shape] || "rgba(196,117,75,0.5)";

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 100 130"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path
          d={path}
          stroke={color}
          strokeWidth="1.5"
          fill={color.replace("0.5", "0.08")}
          strokeDasharray="4 3"
        />

        {/* Confidence indicator dots */}
        {faceAnalysis.confidence > 0.7 && (
          <>
            <circle cx="50" cy="5" r="2" fill={color} opacity="0.8" />
            <circle cx="95" cy="50" r="2" fill={color} opacity="0.8" />
            <circle cx="5" cy="50" r="2" fill={color} opacity="0.8" />
          </>
        )}
      </svg>

      {/* Shape label */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="bg-charcoal/60 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-xs font-body capitalize">
            {shape} face
          </span>
        </div>
      </div>
    </div>
  );
}
