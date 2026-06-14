"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Gift,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/ui/Container";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
];

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="dashboard-shell flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const displayName = user?.firstName || user?.name || "Traveler";

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="dashboard-bg-orbs" aria-hidden="true">
        <div className="dashboard-orb dashboard-orb-primary" />
        <div className="dashboard-orb dashboard-orb-accent" />
      </div>

      <DashboardNavbar />

      <Container className="relative py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          <aside className="lg:col-span-1">
            <div className="dashboard-sidebar sticky top-[calc(4rem+1.5rem)] overflow-hidden">
              <div className="border-b border-white/40 px-4 py-4 dark:border-white/10">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Navigation
                </p>
                <p className="mt-1 text-sm font-semibold">Hi, {displayName}</p>
              </div>

              <nav className="space-y-1 p-3">
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "dashboard-nav-link flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "dashboard-nav-link-active"
                          : "text-foreground/65 hover:bg-primary/5 hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors duration-200",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/40 p-3 dark:border-white/10">
                <button
                  type="button"
                  onClick={logout}
                  className="dashboard-nav-link flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 lg:col-span-1">{children}</main>
        </div>
      </Container>
    </div>
  );
}
