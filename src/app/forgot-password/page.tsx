"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { forgotPassword } from "@/services/auth";
import { imageFixes } from "@/utils/images";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Failed to send reset link");
    }

    setIsLoading(false);
  };

  if (submitted) {
    return (
      <AuthLayout
        image={imageFixes.login}
        headline="Reset your password."
        subtext="Sign in to access exclusive flight deals, custom travel alerts, and member-only pricing tailored just for you."
        badges={["Best Price Guarantee", "500+ Airlines"]}>
        <div className="glossy-card w-full p-8 text-center">
          <h1 className="text-2xl font-bold">Check Your Email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to {email}
          </p>
          <Link href="/login" className="mt-6 inline-block">
            Back to Login
          </Link>
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
          Enter your email address below and we&apos;ll send you a secure link to reset
          your password.
        </p>

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
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
