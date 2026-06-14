"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PublicLayout } from "@/components/layout/PublicLayout";

const faqs = [
  { question: "How do I search for flights?", answer: "Use the search form on the homepage or the Flights page. Enter your departure city, destination, travel date, and number of passengers, then click Search Flights." },
  { question: "Can I book flights for multiple passengers?", answer: "Yes! Set the number of passengers in the search form (up to 9). The total price on the booking page will reflect the number of travelers." },
  { question: "Is payment secure?", answer: "This is a demo application. In a production environment, all payments would be processed through PCI-compliant payment gateways with full encryption." },
  { question: "Can I cancel or change my booking?", answer: "Cancellation and change policies depend on the airline and fare type. Contact our support team at support@tiqwatravel.com for assistance." },
  { question: "Do you offer customer support?", answer: "Yes, our support team is available Monday through Friday, 9 AM to 6 PM EST." },
  { question: "Are the prices shown final?", answer: "Prices displayed are base fares per person. Taxes, fees, and baggage charges may apply and will be shown before you confirm your booking." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PublicLayout>
    <div className="page-fade-in py-28">
      <Container size="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-3 text-muted-foreground">Find answers to common questions about booking with Tiqwa Travel</p>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glossy overflow-hidden rounded-2xl">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left font-medium transition-colors hover:text-primary">
                  {faq.question}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
    </PublicLayout>
  );
}
