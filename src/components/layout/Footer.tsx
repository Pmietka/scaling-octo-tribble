import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/60 mt-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl text-white">StyleSense</h3>
            <p className="font-body text-sm text-white/50 max-w-xs">
              AI-powered hair styling recommendations personalized for your
              unique features.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            <div className="space-y-2">
              <p className="font-body text-xs uppercase tracking-wider text-white/40">
                App
              </p>
              <Link
                href="/onboarding"
                className="block font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Get Analysis
              </Link>
              <Link
                href="/profile"
                className="block font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                My Profile
              </Link>
              <Link
                href="/community"
                className="block font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Community
              </Link>
            </div>
            <div className="space-y-2">
              <p className="font-body text-xs uppercase tracking-wider text-white/40">
                Info
              </p>
              <Link
                href="/auth"
                className="block font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <a
                href="mailto:hello@stylesense.app"
                className="block font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/30">
            2024 StyleSense. AI recommendations are for inspiration only.
          </p>
          <p className="font-body text-xs text-white/30">
            Product links may be affiliate links.
          </p>
        </div>
      </div>
    </footer>
  );
}
