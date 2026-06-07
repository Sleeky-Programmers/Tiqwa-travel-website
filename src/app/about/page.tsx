"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BadgeDollarSign,
  Headphones,
  Lock,
  Quote,
  ShieldCheck,
  Star,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  aboutStats,
  teamMembers,
  trustSafetyItems,
  aboutTestimonials,
} from "@/data/mockData";
import { heroBackgroundImage } from "@/utils/images";

const trustIconMap: Record<string, LucideIcon> = {
  Lock,
  BadgeDollarSign,
  Headphones,
  ShieldCheck,
};

export default function AboutPage() {
  return (
    <main className="page-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBackgroundImage}
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        </div>
        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              About Tiqwa Travel
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Making travel accessible, affordable, and seamless for millions worldwide
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glossy-card p-8 lg:p-10"
          >
            <h2 className="text-2xl font-bold">Our Story</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Tiqwa Travel was founded in 2020 with a simple belief: booking a flight
                should be as effortless as the journey itself. Frustrated by hidden fees,
                confusing interfaces, and unreliable support, our founders set out to
                build the travel platform they wished existed.
              </p>
              <p>
                Today, we partner with over 500 airlines across 100+ countries, serving
                more than 2 million travelers who trust us for transparent pricing,
                instant e-tickets, and round-the-clock customer care.
              </p>
              <p>
                Our mission is to democratize travel — making premium flight booking
                accessible to everyone, everywhere. We believe every traveler deserves
                the best price, zero surprises, and support that never sleeps.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-primary">
                Founded in 2020
              </span>
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-primary">
                2M+ travelers
              </span>
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-primary">
                500+ airlines
              </span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-16 dark:bg-primary/10">
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {aboutStats.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glossy-card p-6 text-center"
              >
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">Leadership Team</h2>
            <p className="mt-3 text-muted-foreground">
              The people building the future of travel
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glossy-card glossy-hover overflow-hidden"
              >
                <div className="relative h-48 w-full bg-primary/5">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust & Safety */}
      <section className="bg-primary/5 py-20 dark:bg-primary/10">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">Trust & Safety</h2>
            <p className="mt-3 text-muted-foreground">
              Your security and peace of mind are our top priorities
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustSafetyItems.map((item, i) => {
              const Icon = trustIconMap[item.icon] ?? ShieldCheck;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glossy-card p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <span className="glossy-card px-4 py-2 text-xs font-semibold text-muted-foreground">
              PCI-DSS Compliant
            </span>
            <span className="glossy-card px-4 py-2 text-xs font-semibold text-muted-foreground">
              256-bit SSL Encryption
            </span>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">What People Say</h2>
            <p className="mt-3 text-muted-foreground">
              Trusted by travelers and airline partners alike
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {aboutTestimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glossy-card glossy-hover flex flex-col p-6"
              >
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${idx < t.rating ? "fill-primary text-primary" : "text-border"}`}
                    />
                  ))}
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary/5 py-16 dark:bg-primary/10">
        <Container className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Join millions of happy travelers
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start your next adventure with Tiqwa Travel today
          </p>
          <Link href="/search" className="mt-6 inline-block">
            <Button size="lg">
              Search Flights
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Container>
      </section>
    </main>
  );
}
