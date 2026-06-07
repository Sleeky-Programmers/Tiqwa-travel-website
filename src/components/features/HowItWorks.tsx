"use client";

import { Search, GitCompare, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const steps = [
  { icon: Search, title: "Search Flights", description: "Enter your destination, dates, and passengers to find the best available flights." },
  { icon: GitCompare, title: "Compare & Choose", description: "Browse results sorted by price or duration and pick the flight that suits you." },
  { icon: Ticket, title: "Book & Fly", description: "Enter passenger details, complete your booking, and get ready for takeoff." },
];

export function HowItWorks() {
  return (
    <section className="bg-primary/5 py-20 dark:bg-primary/10">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-3 text-muted-foreground">Book your dream trip in three easy steps</p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.15 }}>
              <Card className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-primary">Step {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
