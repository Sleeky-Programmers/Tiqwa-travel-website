"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Container } from "@/components/ui/Container";
import { resetPassword } from "@/services/auth";
import { PublicLayout } from "@/components/layout/PublicLayout";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, newPassword, confirmPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(result.error ?? "Password reset failed");
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <PublicLayout>

      <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <div className="glossy-card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-green-600">Password Updated</h1>
          <p className="mt-2 text-muted-foreground">
            Redirecting you to login...
          </p>
        </div>
      </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <Container className="flex min-h-[80vh] items-center justify-center py-20">
      <div className="glossy-card w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[calc(50%+0.75rem)] text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading || !token}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </Container>
    </PublicLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <PublicLayout>
        <Container className="flex min-h-[80vh] items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Container>
        </PublicLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
