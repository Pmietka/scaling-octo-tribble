"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type {
  OnboardingData,
  CapturedPhoto,
  HairType,
  MaintenanceLevel,
  StyleVibe,
  OnboardingStep,
} from "@/lib/types";
import CameraCapture from "@/components/camera/CameraCapture";
import PhotoUploader from "@/components/camera/PhotoUploader";
import AnalysisLoading from "@/components/analysis/AnalysisLoading";
import { cn } from "@/lib/utils";

const DEFAULT_DATA: OnboardingData = {
  photos: [],
  textDescription: "",
  hairType: "",
  currentLength: 5,
  concerns: {
    frizz: false,
    thinning: false,
    dryness: false,
    oiliness: false,
    dandruff: false,
    damage: false,
  },
  maintenanceLevel: "",
  styleVibe: "",
  constraints: "",
};

const HAIR_TYPES: { value: HairType; label: string; desc: string }[] = [
  { value: "straight", label: "Straight", desc: "Flat, no natural curl" },
  { value: "wavy", label: "Wavy", desc: "S-shaped waves" },
  { value: "curly", label: "Curly", desc: "Springy curls" },
  { value: "coily", label: "Coily", desc: "Tight coils or kinks" },
];

const MAINTENANCE_LEVELS: { value: MaintenanceLevel; label: string; desc: string }[] = [
  { value: "low", label: "Low", desc: "Wash and go, minimal styling" },
  { value: "medium", label: "Medium", desc: "Some styling, occasional salon visits" },
  { value: "high", label: "High", desc: "Daily styling, regular appointments" },
];

const STYLE_VIBES: { value: StyleVibe; label: string; emoji: string }[] = [
  { value: "professional", label: "Professional", emoji: "👔" },
  { value: "casual", label: "Casual", emoji: "🤙" },
  { value: "edgy", label: "Edgy", emoji: "⚡" },
  { value: "classic", label: "Classic", emoji: "✨" },
  { value: "trendy", label: "Trendy", emoji: "🔥" },
];

const CONCERNS_LIST = [
  { key: "frizz", label: "Frizz" },
  { key: "thinning", label: "Thinning" },
  { key: "dryness", label: "Dryness" },
  { key: "oiliness", label: "Oiliness" },
  { key: "dandruff", label: "Dandruff" },
  { key: "damage", label: "Damage" },
] as const;

const LENGTH_LABELS: Record<number, string> = {
  1: "Buzz cut",
  2: "Very short",
  3: "Short",
  4: "Ear length",
  5: "Chin length",
  6: "Shoulder length",
  7: "Mid-back",
  8: "Waist length",
  9: "Hip length",
  10: "Floor length",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");

  const updateData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const addPhoto = (photo: CapturedPhoto) => {
    setData((prev) => ({
      ...prev,
      photos: [...prev.photos, photo],
    }));
  };

  const removePhoto = (id: string) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  const canProceed = () => {
    if (step === 1) return data.photos.length >= 1;
    if (step === 2) return data.textDescription.length > 0 || data.hairType !== "";
    return true;
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    setError("");

    try {
      // Prepare photos as base64 strings
      const photoBase64s = data.photos.map((p) => p.dataUrl);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: photoBase64s,
          textDescription: data.textDescription,
          onboardingData: {
            hairType: data.hairType,
            currentLength: data.currentLength,
            concerns: data.concerns,
            maintenanceLevel: data.maintenanceLevel,
            styleVibe: data.styleVibe,
            constraints: data.constraints,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      // Store results in sessionStorage for the results page
      sessionStorage.setItem(
        "analysis_result",
        JSON.stringify({
          result: result.result,
          analysisId: result.analysisId,
          primaryPhoto: data.photos[0]?.dataUrl,
        })
      );

      router.push(`/results/${result.analysisId || "demo"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <AnalysisLoading />;
  }

  return (
    <div className="min-h-screen bg-cream pt-6">
      {/* Camera overlay */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={(photo) => {
              addPhoto(photo);
              setShowCamera(false);
            }}
            onClose={() => setShowCamera(false)}
            photoCount={data.photos.length}
          />
        )}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 pb-20">
        {/* Progress header */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as OnboardingStep)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-4 h-4 text-charcoal" />
              </button>
            ) : (
              <div className="w-9" />
            )}

            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    s === step ? "w-8 h-2 bg-terracotta" : s < step ? "w-2 h-2 bg-terracotta/40" : "w-2 h-2 bg-charcoal/15"
                  )}
                />
              ))}
            </div>

            <span className="text-xs font-body text-charcoal/40 w-9 text-right">
              {step}/3
            </span>
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-3xl text-charcoal mb-2">
                  Add your photos
                </h1>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                  Upload 3 high-quality photos for the most accurate analysis: a front view, a side profile, and a 3/4 angle. Good lighting is essential.
                </p>
              </div>

              <PhotoUploader
                photos={data.photos}
                onAddPhoto={addPhoto}
                onRemovePhoto={removePhoto}
                onOpenCamera={() => setShowCamera(true)}
              />

              {data.photos.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-sage/15 rounded-xl p-4 flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-sage-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-body font-medium text-sage-700">
                      {data.photos.length >= 3 ? "Perfect! 3 photos give the best analysis" : data.photos.length === 2 ? "Add a 3/4 angle for optimal results" : "Photo added — add a side profile next"}
                    </p>
                    <p className="text-xs font-body text-charcoal/60 mt-0.5">
                      {data.photos.length < 3 ? `Add ${3 - data.photos.length} more photo${3 - data.photos.length > 1 ? "s" : ""} for the best facial feature analysis` : data.photos.length < 5 ? `You can add ${5 - data.photos.length} more if you like` : "Maximum photos reached"}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-3xl text-charcoal mb-2">
                  Describe your hair
                </h1>
                <p className="font-body text-sm text-charcoal/60">
                  The more you tell us, the better we can personalize your recommendations.
                </p>
              </div>

              {/* Free text description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-body font-medium text-charcoal">
                  Describe your hair in your own words
                </label>
                <textarea
                  value={data.textDescription}
                  onChange={(e) => updateData({ textDescription: e.target.value })}
                  placeholder="My hair is thick and wavy, gets frizzy in humidity, and I usually keep it medium length. I want something that looks professional but does not take too long to style."
                  rows={4}
                  className="textarea-field"
                />
              </div>

              {/* Hair type selection */}
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-charcoal">
                  Hair type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_TYPES.map((ht) => (
                    <button
                      key={ht.value}
                      onClick={() => updateData({ hairType: ht.value as HairType })}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        data.hairType === ht.value
                          ? "border-terracotta bg-terracotta/5"
                          : "border-charcoal/15 bg-white hover:border-charcoal/30"
                      )}
                    >
                      <p className="font-body text-sm font-medium text-charcoal">{ht.label}</p>
                      <p className="font-body text-xs text-charcoal/50">{ht.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current length slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-body font-medium text-charcoal">
                    Current length
                  </label>
                  <span className="text-sm font-body font-medium text-terracotta">
                    {LENGTH_LABELS[Math.round(data.currentLength)]}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={data.currentLength}
                  onChange={(e) => updateData({ currentLength: Number(e.target.value) })}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #c4754b ${(data.currentLength - 1) * 11.1}%, #e5e7eb ${(data.currentLength - 1) * 11.1}%)`,
                  }}
                />
              </div>

              {/* Concerns */}
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-charcoal">
                  Hair concerns (select all that apply)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONCERNS_LIST.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() =>
                        updateData({
                          concerns: {
                            ...data.concerns,
                            [key]: !data.concerns[key],
                          },
                        })
                      }
                      className={cn(
                        "py-2 px-3 rounded-xl border text-xs font-body font-medium transition-all",
                        data.concerns[key]
                          ? "border-terracotta bg-terracotta/10 text-terracotta"
                          : "border-charcoal/15 bg-white text-charcoal/60 hover:border-charcoal/30"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-3xl text-charcoal mb-2">
                  Style preferences
                </h1>
                <p className="font-body text-sm text-charcoal/60">
                  Help us tailor recommendations to your lifestyle.
                </p>
              </div>

              {/* Maintenance level */}
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-charcoal">
                  How much time do you want to spend on your hair?
                </label>
                <div className="space-y-2">
                  {MAINTENANCE_LEVELS.map((ml) => (
                    <button
                      key={ml.value}
                      onClick={() => updateData({ maintenanceLevel: ml.value as MaintenanceLevel })}
                      className={cn(
                        "w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all",
                        data.maintenanceLevel === ml.value
                          ? "border-terracotta bg-terracotta/5"
                          : "border-charcoal/15 bg-white hover:border-charcoal/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          data.maintenanceLevel === ml.value
                            ? "border-terracotta"
                            : "border-charcoal/30"
                        )}
                      >
                        {data.maintenanceLevel === ml.value && (
                          <div className="w-2 h-2 rounded-full bg-terracotta" />
                        )}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-charcoal">{ml.label}</p>
                        <p className="font-body text-xs text-charcoal/50">{ml.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style vibe */}
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-charcoal">
                  Your style vibe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLE_VIBES.map((sv) => (
                    <button
                      key={sv.value}
                      onClick={() => updateData({ styleVibe: sv.value as StyleVibe })}
                      className={cn(
                        "py-3 px-2 rounded-xl border text-center transition-all",
                        data.styleVibe === sv.value
                          ? "border-terracotta bg-terracotta/5"
                          : "border-charcoal/15 bg-white hover:border-charcoal/30"
                      )}
                    >
                      <div className="text-xl mb-1">{sv.emoji}</div>
                      <p className="font-body text-xs font-medium text-charcoal">{sv.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-1.5">
                <label className="block text-sm font-body font-medium text-charcoal">
                  Any hard constraints? (optional)
                </label>
                <textarea
                  value={data.constraints}
                  onChange={(e) => updateData({ constraints: e.target.value })}
                  placeholder="e.g. I cannot use heat tools, I want to keep my length, I work in healthcare and need a conservative style..."
                  rows={3}
                  className="textarea-field"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm font-body text-red-600">{error}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8">
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as OnboardingStep)}
              disabled={!canProceed()}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-full font-body font-medium text-base transition-all",
                canProceed()
                  ? "bg-terracotta text-white hover:bg-terracotta-600 shadow-lg shadow-terracotta/25"
                  : "bg-charcoal/10 text-charcoal/40 cursor-not-allowed"
              )}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-body font-medium text-base bg-terracotta text-white hover:bg-terracotta-600 shadow-lg shadow-terracotta/25 transition-all"
            >
              Analyze My Hair
              <Check className="w-5 h-5" />
            </button>
          )}

          {step === 1 && data.photos.length === 0 && (
            <p className="text-center text-xs font-body text-charcoal/40 mt-3">
              Add at least 1 photo to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
