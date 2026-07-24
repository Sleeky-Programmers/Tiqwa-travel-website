"use client";

import { motion } from "motion/react";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/form/ContactForm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const DEFAULT_EMAIL = "support@tiqwatravel.com";
const DEFAULT_PHONE = "+1 (800) 555-0199";
const DEFAULT_ADDRESS = "123 Aviation Blvd, New York, NY 10001";

export default function ContactPage() {
  const { settings } = useSiteSettings();

  const address = settings?.physical_address || DEFAULT_ADDRESS;

  const contactInfo = [
    { icon: Mail, label: "Email", value: settings?.support_email || settings?.email_address || DEFAULT_EMAIL },
    { icon: Phone, label: "Phone", value: settings?.support_phone || settings?.phone_number || DEFAULT_PHONE },
    { icon: MapPin, label: "Address", value: address },
  ];

  return (
    <PublicLayout>
    <div className="page-fade-in py-28">
      <Container size="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="section-badge mb-3 inline-flex">Get In Touch</span>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Contact Us</h1>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-14"
          >
            <h2 className="text-xl font-semibold">Find Us</h2>
            <p className="mt-1 text-sm text-muted-foreground">Visit us at our office location.</p>
            <Card padding="none" hover={false} className="mt-4 overflow-hidden">
              <iframe
                title="Office location map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                className="h-80 w-full sm:h-96"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
    </PublicLayout>
  );
}
