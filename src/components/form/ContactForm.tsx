"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <Input label="Name" placeholder="Your name" required />
      <Input label="Email" type="email" placeholder="you@example.com" required />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea
          id="message"
          rows={4}
          required
          placeholder="How can we help?"
          className="w-full rounded-xl border border-input bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
    </form>
  );
}
