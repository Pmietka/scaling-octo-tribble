"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, RefreshCw, BookOpen, History } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile, Analysis, JournalEntry } from "@/lib/types";
import JournalTimeline from "@/components/journal/JournalTimeline";
import { formatDate, compressImage, fileToDataUrl } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"journal" | "history">("journal");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Load analyses
      const { data: analysesData } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setAnalyses(analysesData || []);

      // Load journal entries
      const { data: journalData } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      setJournalEntries(journalData || []);

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handleAddJournalEntry = async (
    file: File,
    notes: string,
    date: string
  ) => {
    if (!user) return;

    const dataUrl = await fileToDataUrl(file);
    const compressed = await compressImage(dataUrl, 1024, 0.85);

    // Convert to blob for upload
    const base64Data = compressed.split(",")[1];
    const blob = new Blob(
      [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
      { type: "image/jpeg" }
    );

    const { uploadJournalPhoto } = await import("@/lib/supabase");
    const photoUrl = await uploadJournalPhoto(blob, user.id);

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        photo_url: photoUrl,
        notes: notes || null,
        date,
      })
      .select()
      .single();

    if (!error && data) {
      setJournalEntries((prev) => [data, ...prev]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-14">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-display text-xl">
              {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-body font-medium text-charcoal">
                {profile?.display_name || "Your Profile"}
              </p>
              <p className="font-body text-xs text-charcoal/50">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <LogOut className="w-4 h-4 text-charcoal/60" />
          </button>
        </motion.div>

        {/* Latest hair profile */}
        {profile?.hair_profile_json && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-charcoal">Your Hair Profile</h2>
              <button
                onClick={() => router.push("/onboarding")}
                className="flex items-center gap-1.5 text-xs font-body text-terracotta hover:text-terracotta-600"
              >
                <RefreshCw className="w-3 h-3" />
                Re-analyze
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Face Shape",
                  value: profile.hair_profile_json.face_analysis?.shape || "Unknown",
                  capitalize: true,
                },
                {
                  label: "Hair Type",
                  value: profile.hair_profile_json.hair_analysis?.type || "Unknown",
                  capitalize: false,
                },
                {
                  label: "Density",
                  value: profile.hair_profile_json.hair_analysis?.density || "Unknown",
                  capitalize: true,
                },
              ].map((item) => (
                <div key={item.label} className="bg-cream rounded-xl p-2.5 text-center">
                  <p className="text-xs font-body text-charcoal/50">{item.label}</p>
                  <p className={`font-display text-sm text-charcoal mt-0.5 ${item.capitalize ? "capitalize" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("journal")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
              activeTab === "journal"
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal/60 border border-charcoal/10"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Hair Journal
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
              activeTab === "history"
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal/60 border border-charcoal/10"
            }`}
          >
            <History className="w-4 h-4" />
            Analysis History
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "journal" ? (
          <JournalTimeline
            entries={journalEntries}
            onAddEntry={handleAddJournalEntry}
          />
        ) : (
          <div className="space-y-3">
            {analyses.length > 0 ? (
              analyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    sessionStorage.setItem(
                      "analysis_result",
                      JSON.stringify({ result: analysis.ai_response_json })
                    );
                    router.push(`/results/${analysis.id}`);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-base text-charcoal">
                        {analysis.ai_response_json?.face_analysis?.shape
                          ? `${analysis.ai_response_json.face_analysis.shape.charAt(0).toUpperCase() + analysis.ai_response_json.face_analysis.shape.slice(1)} Face`
                          : "Hair Analysis"}
                      </p>
                      <p className="font-body text-xs text-charcoal/50">
                        {formatDate(analysis.created_at)}
                      </p>
                    </div>
                    <div className="text-charcoal/30">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                  </div>
                  {analysis.ai_response_json?.recommendations?.length > 0 && (
                    <p className="font-body text-xs text-charcoal/60 mt-2">
                      {analysis.ai_response_json.recommendations.length} style recommendations
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="font-body text-sm text-charcoal/50">No analyses yet</p>
                <button
                  onClick={() => router.push("/onboarding")}
                  className="btn-primary mt-4"
                >
                  Get Your First Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
