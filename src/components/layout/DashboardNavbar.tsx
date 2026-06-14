"use client";

import Link from "next/link";
import { LogOut, Moon, Plane, Search, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const displayName = user?.firstName || user?.name || "User";

  return (
    <header className="dashboard-navbar sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
            <Plane className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-none">Tiqwa Travel</p>
            <p className="text-[11px] text-muted-foreground">Dashboard</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/search"
            className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:flex dark:bg-white/5"
          >
            <Search className="h-3.5 w-3.5" />
            Search Flights
          </Link>

          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full border border-border/60 bg-white/60 p-2 text-foreground/70 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:bg-white/5"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="hidden h-6 w-px bg-border/80 md:block" />

          <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-white/60 py-1 pl-1 pr-3 backdrop-blur-sm dark:bg-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-semibold text-white shadow-sm">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-medium leading-none">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className={cn(
              "rounded-full border border-border/60 bg-white/60 p-2 text-foreground/70 backdrop-blur-sm",
              "transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
              "dark:bg-white/5"
            )}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
