import Link from "next/link";
import { Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-cream pt-14 flex items-center justify-center">
      <div className="max-w-sm mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto">
          <Users className="w-10 h-10 text-terracotta/60" />
        </div>

        <div>
          <h1 className="font-display text-3xl text-charcoal mb-3">
            Community Gallery
          </h1>
          <p className="font-body text-charcoal/60 leading-relaxed">
            A space to share before and after photos, celebrate transformations,
            and inspire others with styles you have tried from your
            recommendations.
          </p>
        </div>

        <div className="card p-5 text-left space-y-3">
          <p className="font-display text-lg text-charcoal">Coming Soon</p>
          <p className="font-body text-sm text-charcoal/60 leading-relaxed">
            We are building the community gallery. When it launches, you will
            be able to:
          </p>
          <ul className="space-y-2">
            {[
              "Post before and after transformation photos",
              "Tag the style and products you used",
              "Like and comment on others' results",
              "Filter by hair type and style",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-terracotta mt-0.5">+</span>
                <span className="font-body text-sm text-charcoal/70">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/onboarding" className="btn-primary inline-flex">
          Get Your Analysis First
        </Link>
      </div>
    </div>
  );
}
