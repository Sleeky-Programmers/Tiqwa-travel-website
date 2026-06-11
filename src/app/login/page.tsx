"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <div className="page-fade-in">
      <Container className="py-20">
        <div className="mx-auto max-w-md">
          <div className="glossy-card p-8">
            <h1 className="text-center text-2xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-center text-muted-foreground">
              Sign in to your account
            </p>

            <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
