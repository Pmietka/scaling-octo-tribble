"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw, Share2, MapPin } from "lucide-react";
import type { AnalysisResult, MatchedProduct } from "@/lib/types";
import HairProfileCard from "@/components/analysis/HairProfileCard";
import StyleCarousel from "@/components/results/StyleCarousel";
import ProductGrid from "@/components/results/ProductGrid";
import { getSessionId } from "@/lib/utils";
import { getSeasonalTip } from "@/lib/seasonal";

interface StoredAnalysis {
  result: AnalysisResult;
  analysisId?: string;
  primaryPhoto?: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Record<string, MatchedProduct[]>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [city, setCity] = useState("");
  const [tipCity, setTipCity] = useState("");
  const [seasonalTip, setSeasonalTip] = useState<ReturnType<typeof getSeasonalTip>>(null);
  const sessionId = getSessionId();

  useEffect(() => {
    // Load analysis from sessionStorage
    const stored = sessionStorage.getItem("analysis_result");
    if (!stored) {
      router.push("/onboarding");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as StoredAnalysis;
      setAnalysis(parsed);
    } catch {
      router.push("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    if (!analysis?.result) return;

    // Fetch product matches
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const concerns = Object.entries(analysis.result.hair_analysis)
          .filter(([, v]) => v === true)
          .map(([k]) => k);

        const response = await fetch("/api/match-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productRecommendations: analysis.result.product_recommendations,
            hairType: analysis.result.hair_analysis.type,
            concerns,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setMatchedProducts(data.products || {});
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [analysis]);

  const handleAffiliateClick = async (productId: string) => {
    try {
      await fetch("/api/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, sessionId }),
      });
    } catch {
      // Non-fatal
    }
  };

  const handleSeasonalTip = () => {
    if (!city) return;
    const tip = getSeasonalTip(city);
    setSeasonalTip(tip);
    setTipCity(city);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: "My StyleSense Hair Analysis",
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { result, primaryPhoto } = analysis;

  return (
    <div className="min-h-screen bg-cream pt-14">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl text-charcoal">Your Results</h1>
            <p className="font-body text-sm text-charcoal/50">
              Personalized just for you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
            >
              <Share2 className="w-4 h-4 text-charcoal/60" />
            </button>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
            >
              <RefreshCw className="w-4 h-4 text-charcoal/60" />
            </button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <div>
          <h2 className="font-display text-lg text-charcoal mb-3">Your Hair Profile</h2>
          <HairProfileCard result={result} primaryPhoto={primaryPhoto} />
        </div>

        {/* Seasonal tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-terracotta" />
            <h3 className="font-display text-base text-charcoal">Seasonal Hair Tips</h3>
          </div>

          {seasonalTip ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <p className="text-2xl">{seasonalTip.emoji}</p>
              <p className="font-body text-sm text-charcoal/70 leading-relaxed">
                {seasonalTip.tip}
              </p>
            </motion.div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city (e.g. Chicago)"
                className="flex-1 input-field text-sm py-2"
                onKeyDown={(e) => e.key === "Enter" && handleSeasonalTip()}
              />
              <button
                onClick={handleSeasonalTip}
                disabled={!city}
                className="btn-primary py-2 px-4 text-sm disabled:opacity-40"
              >
                Get Tips
              </button>
            </div>
          )}
        </motion.div>

        {/* Style Recommendations */}
        <div>
          <h2 className="font-display text-lg text-charcoal mb-3">
            Recommended Styles
          </h2>
          <StyleCarousel
            recommendations={result.recommendations}
            userPhoto={primaryPhoto}
          />
        </div>

        {/* Product Recommendations */}
        <div>
          <h2 className="font-display text-lg text-charcoal mb-3">
            Recommended Products
          </h2>
          {isLoadingProducts ? (
            <div className="card p-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                <p className="font-body text-sm text-charcoal/50">
                  Finding the best products for your hair...
                </p>
              </div>
            </div>
          ) : (
            <ProductGrid
              matchedProducts={matchedProducts}
              aiRecommendations={result.product_recommendations}
              onAffiliateClick={handleAffiliateClick}
            />
          )}
        </div>

        {/* CTA for account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-charcoal rounded-2xl p-6 text-center"
        >
          <h3 className="font-display text-xl text-white mb-2">
            Save your results
          </h3>
          <p className="font-body text-sm text-white/60 mb-4 leading-relaxed">
            Create a free account to save your analysis, track your hair journey
            with a photo journal, and re-analyze anytime.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="flex-1 bg-terracotta text-white py-3 rounded-full font-body font-medium text-sm hover:bg-terracotta-600 transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => router.push("/auth?mode=signin")}
              className="flex-1 bg-white/10 text-white py-3 rounded-full font-body font-medium text-sm hover:bg-white/20 transition-colors"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
