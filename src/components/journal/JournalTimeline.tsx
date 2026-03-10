"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import JournalEntryComponent from "./JournalEntry";
import { formatDate } from "@/lib/utils";

interface JournalTimelineProps {
  entries: JournalEntry[];
  onAddEntry: (photo: File, notes: string, date: string) => Promise<void>;
}

export default function JournalTimeline({
  entries,
  onAddEntry,
}: JournalTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    try {
      await onAddEntry(selectedFile, notes, date);
      setShowAddForm(false);
      setSelectedFile(null);
      setPreview(null);
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group entries by month
  const grouped = entries.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
    const monthYear = new Date(entry.date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Add entry button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-terracotta/30 bg-terracotta/5 text-terracotta hover:border-terracotta hover:bg-terracotta/10 transition-all"
      >
        <Camera className="w-5 h-5" />
        <span className="font-body text-sm font-medium">Add Journal Entry</span>
      </button>

      {/* Add entry form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <h3 className="font-display text-lg text-charcoal">
                New Journal Entry
              </h3>

              {/* Photo upload */}
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-charcoal/70">
                  Photo
                </label>
                <div className="relative">
                  {preview ? (
                    <div className="relative h-48 rounded-xl overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-charcoal/60 flex items-center justify-center text-white text-xs"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-charcoal/20 cursor-pointer hover:border-charcoal/40 transition-colors">
                      <Plus className="w-8 h-8 text-charcoal/30" />
                      <span className="text-xs font-body text-charcoal/40 mt-1">
                        Choose a photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-sm font-body font-medium text-charcoal/70">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-sm font-body font-medium text-charcoal/70">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How is my hair feeling today? What products did I use?"
                  rows={3}
                  className="textarea-field"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || isSubmitting}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([monthYear, monthEntries]) => (
          <div key={monthYear} className="space-y-3">
            <h3 className="font-display text-sm text-charcoal/50 uppercase tracking-wider">
              {monthYear}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {monthEntries.map((entry, i) => (
                <JournalEntryComponent key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-cream-300 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-charcoal/30" />
          </div>
          <p className="font-body text-sm text-charcoal/50">
            Your hair journal is empty
          </p>
          <p className="font-body text-xs text-charcoal/40 mt-1">
            Track your hair journey with weekly or monthly photos
          </p>
        </div>
      )}
    </div>
  );
}
