"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface JournalEntryProps {
  entry: JournalEntry;
  index?: number;
}

export default function JournalEntryComponent({
  entry,
  index = 0,
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setIsExpanded(true)}
      >
        <img
          src={entry.photo_url}
          alt={`Journal entry ${formatDate(entry.date)}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/70 to-transparent p-2">
          <p className="text-white text-xs font-body font-medium">
            {new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          {entry.notes && (
            <p className="text-white/70 text-xs font-body truncate">
              {entry.notes}
            </p>
          )}
        </div>
      </motion.div>

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl overflow-hidden max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={entry.photo_url}
                  alt="Journal entry"
                  className="w-full aspect-square object-cover"
                />
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal/60 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <p className="font-display text-base text-charcoal">
                  {formatDate(entry.date)}
                </p>
                {entry.notes && (
                  <p className="font-body text-sm text-charcoal/70 mt-2">
                    {entry.notes}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
