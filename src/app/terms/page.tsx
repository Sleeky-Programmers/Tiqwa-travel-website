"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { PublicLayout } from "@/components/layout/PublicLayout";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing and using Tiqwa Travel's website and services, you agree to be bound by these Terms of Service." },
  { title: "2. Use of Service", content: "Tiqwa Travel provides a platform for searching and booking flights. You agree to use the service only for lawful purposes and provide accurate information when making bookings." },
  { title: "3. Bookings and Payments", content: "All bookings are subject to availability and confirmation by the respective airline. Prices displayed are subject to change until booking is confirmed." },
  { title: "4. Limitation of Liability", content: "Tiqwa Travel acts as an intermediary between you and airlines. We are not responsible for flight delays, cancellations, or changes made by airlines." },
  { title: "5. Changes to Terms", content: "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms." },
];

export default function TermsPage() {
  return (
    <PublicLayout>
    <div className="page-fade-in py-28">
      <Container size="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: June 7, 2026</p>
          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
    </PublicLayout>
  );
}
