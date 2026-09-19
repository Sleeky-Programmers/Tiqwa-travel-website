"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { OtpInput } from "@/components/form/OtpInput";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { resetPassword } from "@/services/auth";
import { imageFixes } from "@/utils/images";

const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMismatch(false);

    if (!email.trim()) {
      setError("Enter the email address you requested the reset for.");
      return;
    }

    const token = otp.join("");
    if (token.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMismatch(true);
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword({ email: email.trim(), token, newPassword, confirmPassword });
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (result.invalidToken) {
      // Code is invalid/used/expired — send the user back to request a fresh one
      // instead of leaving them stuck on a form that can no longer succeed.
      router.push("/forgot-password?expired=1");
      return;
    }

    if (result.status === 400 && /match/i.test(result.error ?? "")) {
      setMismatch(true);
    }

    setError(result.error ?? "Password reset failed");
  };

  if (success) {
    return (
      <AuthLayout
        image={imageFixes.login}
        headline="Choose a strong password."
        subtext="Sign in to access exclusive flight deals, custom travel alerts, and member-only pricing tailored just for you."
        badges={["Best Price Guarantee", "500+ Airlines"]}>
        <div className="glossy-card w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-600">Password Updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting you to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      image={imageFixes.login}
      headline="Choose a strong password."
      subtext="Sign in to access exclusive flight deals, custom travel alerts, and member-only pricing tailored just for you."
      badges={["Best Price Guarantee", "500+ Airlines"]}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Cancel and return to <Link href="/login">Sign In</Link>
        </p>
      }>
      <div>
        <h1 className="text-3xl font-extrabold">Reset Your Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the {OTP_LENGTH}-digit code we emailed you along with your new password.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@fly4cheaper.com"
            required
          />

          <fieldset>
            <legend className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Verification Code<span className="ml-1 text-primary">*</span>
            </legend>
            <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
          </fieldset>

          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              helperText={!passwordTooShort ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
              error={passwordTooShort ? `Must be at least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[calc(50%+0.75rem)] text-muted-foreground transition-colors duration-200 hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setMismatch(false);
            }}
            placeholder="••••••••"
            error={mismatch ? "Passwords do not match." : undefined}
            required
          />
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
