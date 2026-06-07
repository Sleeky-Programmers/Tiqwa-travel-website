"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { testimonials, stats } from "@/data/mockData";

export function TestimonialsSection() {
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
            Loved by Travelers Worldwide
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join millions of happy travelers who book with Tiqwa
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glossy-card p-5 text-center"
            >
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glossy-card glossy-hover flex flex-col p-6"
            >
              <Quote className="h-8 w-8 text-primary/30" />
              <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${idx < t.rating ? "fill-primary text-primary" : "text-border"}`}
                  />
                ))}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
