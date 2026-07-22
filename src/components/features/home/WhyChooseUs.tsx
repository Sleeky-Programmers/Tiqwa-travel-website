"use client";

import {
  BadgeDollarSign,
  Headphones,
  Lock,
  Plane,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { whyUsFeatures } from "@/data/mockData";

const iconMap: Record<string, LucideIcon> = {
  BadgeDollarSign,
  ShieldCheck,
  Zap,
  Headphones,
  Plane,
  Lock,
};

export function WhyChooseUs() {
  return (
    <section className="py-20">
      <Container>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="section-badge mb-3 inline-flex">
            <Zap className="h-3 w-3" />
            Why Tiqwa
          </span>
          <h2 className="section-heading">Travel Smarter, Not Harder</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Everything you need for a seamless booking experience
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyUsFeatures.map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? Plane;
            const isFeatured = i === 0; // First card is the hero card

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`hover-lift glossy-card relative overflow-hidden p-7 ${
                  isFeatured ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""
                }`}
              >
                {/* Number label */}
                <span className="absolute top-5 right-5 text-xs font-bold text-foreground/12 tracking-widest tabular-nums select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon container with white card + colored dot */}
                <div className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-card border border-border shadow-sm">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                </div>

                <h3 className="text-base font-semibold leading-snug">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
