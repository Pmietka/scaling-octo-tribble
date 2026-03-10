"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import type { CapturedPhoto } from "@/lib/types";
import { compressImage } from "@/lib/utils";
import PhotoGuidance from "./PhotoGuidance";

interface CameraCaptureProps {
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
  photoCount: number;
}

export default function CameraCapture({
  onCapture,
  onClose,
  photoCount,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [lightingFeedback, setLightingFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [angle, setAngle] = useState<CapturedPhoto["angle"]>("front");

  const angles: CapturedPhoto["angle"][] = ["front", "side", "back", "other"];
  const angleLabels = {
    front: "Front View",
    side: "Side Profile",
    back: "Back of Head",
    other: "Additional View",
  };

  const currentAngle = photoCount < 3 ? angles[photoCount] || "other" : "other";

  useEffect(() => {
    setAngle(currentAngle);
  }, [currentAngle]);

  const startCamera = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
      }
    } catch {
      setError(
        "Camera access denied. Please allow camera access in your browser settings."
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    // Analyze lighting from video feed
    const interval = setInterval(() => {
      if (!videoRef.current || !isActive) return;
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, 64, 64);
      const imageData = ctx.getImageData(0, 0, 64, 64).data;
      let brightness = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        brightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
      }
      brightness /= imageData.length / 4;

      if (brightness < 60) setLightingFeedback("Low lighting, move toward a window");
      else if (brightness > 200) setLightingFeedback("Too bright, reduce direct light");
      else setLightingFeedback("Good lighting");
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  const flipCamera = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(startCamera, 300);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const compressed = await compressImage(dataUrl, 1024, 0.85);
    setCapturedPreview(compressed);
  };

  const acceptCapture = async () => {
    if (!capturedPreview) return;
    onCapture({
      id: `photo_${Date.now()}`,
      dataUrl: capturedPreview,
      angle,
    });
    setCapturedPreview(null);
    onClose();
  };

  const retakePhoto = () => {
    setCapturedPreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-charcoal flex flex-col"
    >
      <div className="relative flex-1 overflow-hidden">
        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            facingMode === "user" ? "scale-x-[-1]" : ""
          }`}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Guidance Overlay */}
        {!capturedPreview && (
          <PhotoGuidance angle={angle} />
        )}

        {/* Captured Preview */}
        <AnimatePresence>
          {capturedPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={capturedPreview}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white max-w-sm">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-60" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-white text-xs font-body font-medium">
              {angleLabels[angle]}
            </span>
          </div>

          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Lighting Feedback */}
        {lightingFeedback && !capturedPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 left-0 right-0 flex justify-center px-4"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <p className="text-white text-xs font-body">
                {lightingFeedback === "Good lighting" ? "✓" : "⚠"}{" "}
                {lightingFeedback}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-charcoal p-6 safe-bottom">
        {capturedPreview ? (
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-body">Retake</span>
            </button>

            <button
              onClick={acceptCapture}
              className="flex flex-col items-center gap-1 text-white hover:text-terracotta transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-terracotta flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>
              <span className="text-xs font-body">Use Photo</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              disabled={!isActive}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
              style={{ width: 72, height: 72 }}
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
