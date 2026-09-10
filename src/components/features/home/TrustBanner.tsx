"use client";

import { motion } from "motion/react";
import { stats } from "@/data/mockData";
import { Container } from "@/components/ui/Container";

export function TrustBanner() {
  return (
    <section className="band-dark pt-28 pb-12 md:pt-32 md:pb-14">
      <Container>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-primary sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted sm:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
