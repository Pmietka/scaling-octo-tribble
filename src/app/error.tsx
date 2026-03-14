"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>

        <div>
          <h1 className="font-display text-2xl text-charcoal mb-2">
            Something went wrong
          </h1>
          <p className="font-body text-sm text-charcoal/60 leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a
            href="/"
            className="font-body text-sm text-charcoal/50 hover:text-charcoal transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
