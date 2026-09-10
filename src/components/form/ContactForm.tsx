"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendContactMessage } from "@/services/whitelabel-api";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await sendContactMessage(form);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="glossy rounded-2xl p-8 text-center">
        <p className="text-lg font-medium text-primary">Thank you! We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glossy space-y-4 rounded-2xl p-6">
      <Input label="Name" placeholder="Your name" value={form.name} onChange={handleChange("name")} required />
      <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange("email")} required />
      <Input label="Phone" type="tel" placeholder="Your phone number" value={form.phone} onChange={handleChange("phone")} required />
      <Input label="Subject" placeholder="What is this about?" value={form.subject} onChange={handleChange("subject")} required />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea
          id="message"
          rows={4}
          required
          placeholder="How can we help?"
          value={form.message}
          onChange={handleChange("message")}
          className="w-full rounded-xl border border-input bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
