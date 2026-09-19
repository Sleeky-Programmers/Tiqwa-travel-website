"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { forgotPassword } from "@/services/auth";
import { imageFixes } from "@/utils/images";

const RESEND_COOLDOWN_SECONDS = 60;
const REDIRECT_DELAY_MS = 1500;

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || isLoading) return;

    setError(null);
    setIsLoading(true);

    const result = await forgotPassword(email);

    // Never reveal whether the email exists — a 404 moves forward the same
    // way a real send would, so the response can't be used to enumerate accounts.
    if (result.success || result.status === 404) {
      setSubmitted(true);
      setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), REDIRECT_DELAY_MS);
    } else if (result.status === 429) {
      setError("Too many requests. Please wait before trying again.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } else {
      setError(result.error ?? "Failed to send reset code");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }

    setIsLoading(false);
  };

  if (submitted) {
    return (
      <AuthLayout
        image={imageFixes.login}
        headline="Check your email."
        subtext="Sign in to access exclusive flight deals, custom travel alerts, and member-only pricing tailored just for you."
        badges={["Best Price Guarantee", "500+ Airlines"]}>
        <div className="glossy-card w-full p-8 text-center">
          <h1 className="text-2xl font-bold">Code Sent</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for {email}, we&apos;ve sent a 6-digit reset code to it.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Taking you to the reset screen...</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      image={imageFixes.login}
      headline="Reset your password."
      subtext="Sign in to access exclusive flight deals, custom travel alerts, and member-only pricing tailored just for you."
      badges={["Best Price Guarantee", "500+ Airlines"]}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remember your password? <Link href="/login">Back to Sign In</Link>
        </p>
      }>
      <div>
        <h1 className="text-3xl font-extrabold">Forgot Password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address below and we&apos;ll send you a 6-digit code to reset
          your password.
        </p>

        {expired && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Your previous reset code is invalid or has expired. Request a new one below.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@fly4cheaper.com"
            required
          />
          <Button type="submit" className="w-full" size="lg" disabled={isLoading || cooldown > 0}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : cooldown > 0 ? (
              `Try again in ${cooldown}s`
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
