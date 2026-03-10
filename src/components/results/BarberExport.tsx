"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { X, Printer, Share2 } from "lucide-react";
import type { StyleRecommendation } from "@/lib/types";

interface BarberExportProps {
  recommendation: StyleRecommendation;
  userPhoto?: string;
  onClose: () => void;
}

export default function BarberExport({
  recommendation,
  userPhoto,
  onClose,
}: BarberExportProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `StyleSense: ${recommendation.style_name}`,
      text: recommendation.barber_instructions,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(recommendation.barber_instructions);
      alert("Instructions copied to clipboard!");
    }
  };

  const maintenanceColors = {
    low: "#87a878",
    medium: "#c4754b",
    high: "#1a1a2e",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-charcoal/10">
          <div>
            <p className="text-xs font-body text-charcoal/50 uppercase tracking-wider">
              Show your barber
            </p>
            <h3 className="font-display text-xl text-charcoal">
              {recommendation.style_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-cream-400 transition-colors"
          >
            <X className="w-4 h-4 text-charcoal/60" />
          </button>
        </div>

        {/* Printable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5 print-content">
            {/* StyleSense Header (print only) */}
            <div className="hidden print:flex items-center gap-2 pb-4 border-b border-charcoal/10">
              <div className="text-charcoal">
                <span className="font-display text-xl">StyleSense</span>
              </div>
            </div>

            {/* Style Info */}
            <div className="flex gap-4">
              {userPhoto && (
                <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={userPhoto}
                    alt="Current look"
                    className="w-full h-full object-cover object-top"
                  />
                  <p className="text-xs font-body text-charcoal/50 text-center mt-1">
                    Current
                  </p>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-display text-lg text-charcoal">
                  {recommendation.style_name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-body px-2 py-0.5 rounded-full capitalize"
                    style={{
                      backgroundColor:
                        maintenanceColors[recommendation.maintenance_level] +
                        "20",
                      color:
                        maintenanceColors[recommendation.maintenance_level],
                    }}
                  >
                    {recommendation.maintenance_level} maintenance
                  </span>
                </div>
                <p className="text-sm font-body text-charcoal/60 mt-2 leading-relaxed">
                  {recommendation.description}
                </p>
              </div>
            </div>

            {/* Barber Instructions */}
            <div className="bg-cream rounded-2xl p-4">
              <h4 className="font-body text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
                <span>✂️</span> Instructions for Your Stylist
              </h4>
              <p className="font-body text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                {recommendation.barber_instructions}
              </p>
            </div>

            {/* Why it works */}
            <div>
              <h4 className="font-body text-sm font-semibold text-charcoal mb-2">
                Why This Style
              </h4>
              <p className="font-body text-sm text-charcoal/70 leading-relaxed">
                {recommendation.why_it_works}
              </p>
            </div>

            {/* Reference image search */}
            {recommendation.search_keywords.length > 0 && (
              <div>
                <h4 className="font-body text-sm font-semibold text-charcoal mb-2">
                  Search for Reference Images
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.search_keywords.map((kw, i) => (
                    <a
                      key={i}
                      href={`https://www.google.com/search?q=${encodeURIComponent(kw + " hairstyle")}&tbm=isch`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-body px-3 py-1.5 bg-charcoal text-white rounded-full hover:bg-charcoal/80 transition-colors no-print"
                    >
                      {kw}
                    </a>
                  ))}
                  {/* Print-only version */}
                  <p className="text-sm font-body text-charcoal/60 hidden print:block">
                    {recommendation.search_keywords.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* StyleSense footer */}
            <div className="pt-4 border-t border-charcoal/10">
              <p className="text-xs font-body text-charcoal/40 text-center">
                Generated by StyleSense AI Hair Consultant
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-5 border-t border-charcoal/10 flex gap-3 no-print">
          <button
            onClick={handleShare}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
