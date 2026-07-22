"use client";

import {
  Sparkles,
  Headphones,
  ShieldCheck,
  BadgeDollarSign,
  Clock,
} from "lucide-react";

const badges = [
  { icon: Sparkles, text: "2M+ Travelers Trust Tiqwa" },
  { icon: ShieldCheck, text: "100% Secure Booking" },
  { icon: BadgeDollarSign, text: "Best Price Guarantee" },
  { icon: Headphones, text: "24/7 Customer Support" },
  { icon: Clock, text: "Instant Confirmation" },
  // Duplicated for seamless loop
  { icon: Sparkles, text: "2M+ Travelers Trust Tiqwa" },
  { icon: ShieldCheck, text: "100% Secure Booking" },
  { icon: BadgeDollarSign, text: "Best Price Guarantee" },
  { icon: Headphones, text: "24/7 Customer Support" },
  { icon: Clock, text: "Instant Confirmation" },
];

export function TrustBanner() {
  return (
    <section className="border-y border-border bg-primary/4 dark:bg-primary/8 py-4 overflow-hidden">
      {/* Marquee container */}
      <div className="relative flex overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-primary/4 to-transparent dark:from-primary/8" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-primary/4 to-transparent dark:from-primary/8" />

        <div className="marquee-track">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-2 whitespace-nowrap px-6 text-sm font-medium text-foreground/75"
              >
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                {badge.text}
                <span className="mx-4 h-4 w-px bg-border" />
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
