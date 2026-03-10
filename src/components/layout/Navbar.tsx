"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isResultsPage = pathname.startsWith("/results/");
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show navbar on onboarding
  if (isOnboarding) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled || isResultsPage
            ? "bg-cream/95 backdrop-blur-sm border-b border-charcoal/10"
            : "bg-transparent"
        )}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl text-charcoal hover:text-terracotta transition-colors"
          >
            StyleSense
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    "text-sm font-body transition-colors",
                    pathname === "/profile"
                      ? "text-terracotta"
                      : "text-charcoal/60 hover:text-charcoal"
                  )}
                >
                  My Profile
                </Link>
                <Link
                  href="/onboarding"
                  className="btn-primary text-sm py-2"
                >
                  New Analysis
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors"
                >
                  Sign in
                </Link>
                <Link href="/onboarding" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-charcoal/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-charcoal" />
            ) : (
              <Menu className="w-5 h-5 text-charcoal" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-30 bg-cream/98 backdrop-blur-sm border-b border-charcoal/10 sm:hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-charcoal/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-charcoal/50" />
                    <span className="font-body text-sm text-charcoal">
                      My Profile
                    </span>
                  </Link>
                  <Link
                    href="/onboarding"
                    className="btn-primary w-full text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    New Analysis
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-charcoal/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-charcoal/50" />
                    <span className="font-body text-sm text-charcoal">
                      Sign in
                    </span>
                  </Link>
                  <Link
                    href="/onboarding"
                    className="btn-primary w-full text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
