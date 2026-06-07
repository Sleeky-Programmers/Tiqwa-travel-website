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
    <section className="bg-primary/5 py-20 dark:bg-primary/10">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Travel Smarter, Not Harder
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need for a seamless booking experience
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyUsFeatures.map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? Plane;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glossy-card glossy-hover p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
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
