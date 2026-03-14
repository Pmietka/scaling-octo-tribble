import Link from "next/link";
import { Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto">
          <Scissors className="w-10 h-10 text-terracotta/60" />
        </div>

        <div>
          <p className="font-display text-6xl text-terracotta mb-3">404</p>
          <h1 className="font-display text-2xl text-charcoal mb-2">
            Page not found
          </h1>
          <p className="font-body text-sm text-charcoal/60 leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link
            href="/onboarding"
            className="font-body text-sm text-terracotta hover:text-terracotta-600 transition-colors"
          >
            Get a hair analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
