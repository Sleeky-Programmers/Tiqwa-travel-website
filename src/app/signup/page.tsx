"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  return (
    <div className="page-fade-in">
      <Container className="py-20">
        <div className="mx-auto max-w-md">
          <div className="glossy-card p-8">
            <h1 className="text-center text-2xl font-bold">Create Account</h1>
            <p className="mt-2 text-center text-muted-foreground">
              Join Tiqwa Travel today
            </p>

            <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First Name" placeholder="John" required />
                <Input label="Last Name" placeholder="Doe" required />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+234 801 234 5678"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
              />
              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
