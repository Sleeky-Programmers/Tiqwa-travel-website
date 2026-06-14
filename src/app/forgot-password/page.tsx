"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Container } from "@/components/ui/Container";
import { forgotPassword } from "@/services/auth";
import { PublicLayout } from "@/components/layout/PublicLayout";

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
      <PublicLayout>
      <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <div className="glossy-card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">Check Your Email</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve sent a password reset link to {email}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-primary hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <div className="page-fade-in">
      <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <div className="glossy-card w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email to receive a reset link
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </Container>
    </div>
    </PublicLayout>
  );
}
