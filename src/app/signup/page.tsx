"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { signup } from "@/services/auth";
import { formatPhoneNumber } from '@/utils/phone';
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const { confirmPassword: _, ...signupData } = formData;
    const payload = {
      ...signupData,
      phone: signupData.phone.trim() || undefined,
    };
    const result = await signup(payload);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(result.error ?? "Signup failed. Please try again.");
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <PublicLayout>

      <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <div className="glossy-card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-green-600">Account Created!</h1>
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
    <div className="page-fade-in">
      <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <div className="glossy-card w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join Tiqwa Travel today
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Doe"
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@example.com"
              required
            />
            <Input
              label="Phone (Optional)"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                handlePhoneChange(e)
              }
              placeholder="+234 801 234 5678"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[calc(50%+0.30rem)] text-muted-foreground hover:text-foreground"
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
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </div>
    </PublicLayout>
  );
}
