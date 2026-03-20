"use client";

import { useCallback, useState, useRef, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Plus, Check } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canAddMore = photos.length < maxPhotos;

  const assignAngle = (index: number): CapturedPhoto["angle"] => {
    const angles: CapturedPhoto["angle"][] = ["front", "side", "back", "other"];
    return angles[index] || "other";
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!canAddMore) return;
      setIsProcessing(true);

      try {
        const remaining = maxPhotos - photos.length;
        const fileArray = Array.from(files).slice(0, remaining);

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const dataUrl = await fileToDataUrl(file);
          const compressed = await compressImage(dataUrl, 1024, 0.85);

          onAddPhoto({
            id: `photo_${Date.now()}_${i}`,
            dataUrl: compressed,
            angle: assignAngle(photos.length + i),
            file,
          });
        }
      } catch (err) {
        console.error("Failed to process photo:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [canAddMore, maxPhotos, photos.length, onAddPhoto]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      processFiles(files);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [processFiles]
  );

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

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

        {/* Camera button slot */}
        {canAddMore && (
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
        )}
      </div>

      {/* Upload zone */}
      {canAddMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer border-charcoal/20 hover:border-charcoal/40"
        >
          <div className="flex flex-col items-center gap-3">
            {isProcessing ? (
              <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white border border-charcoal/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-charcoal/60" />
                </div>
                <div>
                  <p className="text-sm font-body font-medium text-charcoal/70">
                    {photos.length === 0 ? "Tap to upload photos" : "Add another photo"}
                  </p>
                  <p className="text-xs font-body text-charcoal/40 mt-1">
                    JPG, PNG, WEBP or HEIC · up to {maxPhotos - photos.length} more
                  </p>
                </div>
              </>
            )}
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
