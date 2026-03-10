"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Camera, Package, Clock } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Photo Analysis",
    description:
      "Upload 2 to 5 photos from different angles. Our AI identifies your face shape, hair type, and current condition.",
  },
  {
    icon: Sparkles,
    title: "Personalized Styles",
    description:
      "Get 3 to 5 hairstyle recommendations tailored to your features, lifestyle, and maintenance preferences.",
  },
  {
    icon: Package,
    title: "Product Matching",
    description:
      "Discover the exact products your hair needs, matched by ingredients that work for your specific hair type.",
  },
  {
    icon: Clock,
    title: "Hair Journal",
    description:
      "Track your hair journey over time with periodic photos and notes. See how far you have come.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "My stylist was amazed at how detailed the instructions were. We finally nailed the cut I have been trying to describe for years.",
    name: "Maya R.",
    detail: "Wavy hair, oval face",
  },
  {
    quote:
      "The product recommendations were spot on. Three months in and my frizz is completely under control.",
    name: "James T.",
    detail: "Curly hair, square face",
  },
  {
    quote:
      "I never knew my face shape before. Now I understand exactly why certain cuts work for me.",
    name: "Sofia L.",
    detail: "Straight hair, heart face",
  },
];

function WaveDecoration() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
      <svg
        viewBox="0 0 1440 80"
        className="w-full"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 Q360 80 720 40 Q1080 0 1440 40 L1440 80 L0 80 Z"
          fill="#faf3e0"
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-warm min-h-screen flex items-center overflow-hidden pt-14">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-sage/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span className="text-white/80 text-sm font-body">
                Powered by Claude AI Vision
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-white leading-none">
              Your hair, <br />
              <span className="italic text-terracotta">understood.</span>
            </h1>

            <p className="font-body text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
              Upload a few photos and our AI stylist analyzes your face shape,
              hair texture, and goals to recommend the perfect styles and
              products for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/onboarding"
                className="group flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-full font-body font-medium text-base hover:bg-terracotta-600 active:bg-terracotta-700 transition-all duration-200 shadow-lg shadow-terracotta/25"
              >
                Get Your Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-white/50 text-sm font-body">
                Free to try, no account required
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mt-16 mx-auto max-w-xs"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-1 border border-white/20 shadow-2xl">
              <div className="bg-charcoal rounded-2xl overflow-hidden aspect-[9/16] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal-800 to-terracotta/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-terracotta/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-terracotta" />
                  </div>
                  <p className="font-display text-2xl text-white mb-2">Face Shape</p>
                  <p className="font-display text-4xl text-terracotta">Oval</p>
                  <p className="font-body text-xs text-white/50 mt-1">94% confidence</p>
                  <div className="mt-6 w-full space-y-2">
                    {["The Modern Textured Crop", "Layered Mid-Length", "Curtain Bangs"].map((style) => (
                      <div key={style} className="bg-white/10 rounded-lg px-3 py-2 text-left">
                        <p className="text-white text-xs font-body font-medium">{style}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-lg p-3"
            >
              <p className="text-xs font-body font-medium text-charcoal">Good lighting</p>
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-1/2 bg-white rounded-2xl shadow-lg p-3"
            >
              <p className="text-xs font-body font-medium text-charcoal">Hair type 2C</p>
            </motion.div>
          </motion.div>
        </div>

        <WaveDecoration />
      </section>

      {/* How it works */}
      <section className="bg-cream py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">How it works</h2>
            <p className="font-body text-charcoal/60 max-w-md mx-auto">
              Three simple steps to your perfect hairstyle
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Upload your photos",
                desc: "Take 2 to 5 photos from different angles using your phone camera or upload from your gallery.",
                color: "bg-terracotta/10 text-terracotta",
              },
              {
                step: "02",
                title: "Describe your goals",
                desc: "Tell us about your hair type, concerns, maintenance preferences, and the style vibe you are going for.",
                color: "bg-sage/20 text-sage-700",
              },
              {
                step: "03",
                title: "Get your results",
                desc: "Receive personalized style recommendations, product suggestions, and printable barber instructions.",
                color: "bg-charcoal/10 text-charcoal",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className={`inline-flex w-12 h-12 rounded-full items-center justify-center text-lg font-display font-bold mb-4 ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="font-display text-xl text-charcoal mb-2">{item.title}</h3>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-3">Everything your hair needs</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-terracotta" />
                </div>
                <h3 className="font-display text-lg text-charcoal mb-2">{feature.title}</h3>
                <p className="font-body text-sm text-charcoal/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-charcoal py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl text-white mb-3">What people are saying</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 rounded-2xl p-5 border border-white/10"
              >
                <p className="font-body text-sm text-white/80 leading-relaxed italic mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-body text-sm font-medium text-white">{t.name}</p>
                  <p className="font-body text-xs text-white/40">{t.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-terracotta py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-display text-4xl text-white">Ready to find your perfect style?</h2>
            <p className="font-body text-white/80 text-base">
              Get your AI hair analysis in under 2 minutes. No account required to start.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-white text-terracotta px-8 py-4 rounded-full font-body font-semibold text-base hover:bg-cream transition-colors shadow-lg"
            >
              Start My Analysis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
