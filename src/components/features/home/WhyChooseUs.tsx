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
          <span className="section-badge mb-3 inline-flex">Why Tiqwa</span>
          <h2 className="section-heading">Travel Smarter, Not Harder</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Everything you need for a seamless, premium booking experience
          </p>
        </motion.div>

        {/* Plain feature grid — no cards, matches the rest of the page's lighter rhythm */}
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {whyUsFeatures.map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? Plane;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
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
