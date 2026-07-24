"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { PublicLayout } from "@/components/layout/PublicLayout";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide when searching for flights or making bookings, including name, email, phone number, and payment details." },
  { title: "How We Use Your Information", content: "Your information is used to process bookings, send confirmations, improve our services, and communicate with you about your travel plans." },
  { title: "Data Storage", content: "We store your data securely using industry-standard encryption. Theme preferences are stored locally in your browser." },
  { title: "Cookies", content: "We use essential cookies to maintain your session and preferences such as theme selection." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data. Contact us at privacy@tiqwatravel.com." },
  { title: "Contact", content: "For privacy concerns, reach out to privacy@tiqwatravel.com or write to us at 123 Aviation Blvd, New York, NY 10001." },
];

export default function PrivacyPage() {
  return (
    <PublicLayout>

    <div className="page-fade-in py-28">
      <Container size="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: June 7, 2026</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            At Tiqwa Travel, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
          </p>
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
