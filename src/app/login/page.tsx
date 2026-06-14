"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Container } from "@/components/ui/Container";
import { login } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login({ email, password });

    if (result.success) {
      await refreshUser();
      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.push(redirect);
    } else {
      setError(result.error ?? "Invalid email or password");
    }

    setIsLoading(false);
  };

  return (
    <PublicLayout>
    <div className="page-fade-in">
      <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <div className="glossy-card w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your Tiqwa account
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
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </Container>
    </div>
    </PublicLayout>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
