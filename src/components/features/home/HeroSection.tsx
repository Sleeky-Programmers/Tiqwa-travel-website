"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { FlightSearchForm } from "@/components/features/FlightSearchForm";
import { Container } from "@/components/ui/Container";
import { trustBadges } from "@/data/mockData";
import { heroBackgroundImage } from "@/utils/images";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBackgroundImage}
          alt="Travel background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/30" />
      </div>

      <Container className="relative z-10 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Fly Anywhere,{" "}
            <span className="text-primary">Pay Less</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            Premium flight booking with the best prices guaranteed
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {badge}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-5xl"
        >
          <FlightSearchForm />
        </motion.div>
      </Container>
    </section>
  );
}
