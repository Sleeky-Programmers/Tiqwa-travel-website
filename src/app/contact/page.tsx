"use client";

import { motion } from "motion/react";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/form/ContactForm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PublicLayout } from "@/components/layout/PublicLayout";

const contactInfo = [
  { icon: Mail, label: "Email", value: "support@tiqwatravel.com" },
  { icon: Phone, label: "Phone", value: "+1 (800) 555-0199" },
  { icon: MapPin, label: "Address", value: "123 Aviation Blvd, New York, NY 10001" },
];

export default function ContactPage() {
  return (
    <PublicLayout>
    <div className="page-fade-in py-28">
      <Container size="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">Have a question or need help? We&apos;d love to hear from you.</p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <Card key={item.label} hover={false} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </Card>
              ))}
            </div>
            <ContactForm />
          </div>
        </motion.div>
      </Container>
    </div>
    </PublicLayout>
  );
}
