"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Plus, Check } from "lucide-react";
import type { CapturedPhoto } from "@/lib/types";
import { fileToDataUrl, compressImage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
  photos: CapturedPhoto[];
  onAddPhoto: (photo: CapturedPhoto) => void;
  onRemovePhoto: (id: string) => void;
  onOpenCamera: () => void;
  maxPhotos?: number;
}

const ANGLE_LABELS: Record<CapturedPhoto["angle"], string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  other: "Extra",
};

export default function PhotoUploader({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onOpenCamera,
  maxPhotos = 5,
}: PhotoUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const canAddMore = photos.length < maxPhotos;

  const assignAngle = (index: number): CapturedPhoto["angle"] => {
    const angles: CapturedPhoto["angle"][] = ["front", "side", "back", "other"];
    return angles[index] || "other";
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canAddMore) return;
      setIsProcessing(true);

      try {
        const remaining = maxPhotos - photos.length;
        const filesToProcess = acceptedFiles.slice(0, remaining);

        for (let i = 0; i < filesToProcess.length; i++) {
          const file = filesToProcess[i];
          const dataUrl = await fileToDataUrl(file);
          const compressed = await compressImage(dataUrl, 1024, 0.85);

          onAddPhoto({
            id: `photo_${Date.now()}_${i}`,
            dataUrl: compressed,
            angle: assignAngle(photos.length + i),
            file,
          });
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [canAddMore, maxPhotos, photos.length, onAddPhoto]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
    disabled: !canAddMore || isProcessing,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <img
                src={photo.dataUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Angle badge */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2">
                <span className="text-white text-xs font-body font-medium">
                  {ANGLE_LABELS[photo.angle]}
                </span>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemovePhoto(photo.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-charcoal/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Check mark for first 2 required photos */}
              {index < 2 && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-sage flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Photo Slots */}
        {canAddMore && (
          <>
            {/* Camera option */}
            <motion.button
              layout
              onClick={onOpenCamera}
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                "border-terracotta/40 bg-terracotta/5 hover:border-terracotta hover:bg-terracotta/10"
              )}
            >
              <Camera className="w-6 h-6 text-terracotta" />
              <span className="text-xs font-body text-terracotta font-medium">
                Camera
              </span>
            </motion.button>

            {/* Upload drop zone (only show if there's space for another) */}
            {photos.length < maxPhotos - 1 && (
              <div
                {...getRootProps()}
                className={cn(
                  "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                  isDragActive
                    ? "border-terracotta bg-terracotta/10"
                    : "border-charcoal/20 bg-charcoal/5 hover:border-charcoal/40"
                )}
              >
                <input {...getInputProps()} />
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-charcoal/40" />
                    <span className="text-xs font-body text-charcoal/40 text-center leading-tight px-1">
                      Upload
                    </span>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Drop zone for bulk upload */}
      {photos.length === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
            isDragActive
              ? "border-terracotta bg-terracotta/5"
              : "border-charcoal/20 hover:border-charcoal/40"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cream-300 flex items-center justify-center">
              <Plus className="w-6 h-6 text-charcoal/60" />
            </div>
            <div>
              <p className="text-sm font-body font-medium text-charcoal/70">
                {isDragActive ? "Drop photos here" : "Drag and drop photos"}
              </p>
              <p className="text-xs font-body text-charcoal/40 mt-1">
                Or use the Camera and Upload buttons above
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i < photos.length
                  ? "w-6 bg-terracotta"
                  : i < 2
                  ? "w-4 bg-charcoal/20"
                  : "w-3 bg-charcoal/10"
              )}
            />
          ))}
        </div>
        <span className="text-xs font-body text-charcoal/50">
          {photos.length}/5 photos
          {photos.length < 2 && ` (${2 - photos.length} required)`}
        </span>
      </div>

      {photos.length < 2 && (
        <p className="text-xs font-body text-charcoal/50 text-center">
          Add at least 2 photos for the best analysis results
        </p>
      )}
    </div>
  );
}
