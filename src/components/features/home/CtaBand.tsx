"use client";

import { motion } from "motion/react";
import { PlaneTakeoff } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="band-dark py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <PlaneTakeoff className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-foreground sm:text-4xl">
            Ready to take off?
          </h2>
          <p className="mt-3 text-ink-muted">
            Search hundreds of airlines in seconds and book your next adventure with confidence.
          </p>
          <Button href="/search" size="lg" className="mt-8">
            Search Flights
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
