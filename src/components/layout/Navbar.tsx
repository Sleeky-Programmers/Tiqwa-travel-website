"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BadgeCheck, Clock3, LayoutDashboard, Menu, Moon, Plane, ShieldCheck, Sun, Ticket, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Button } from "@/components/ui/Button";
import { Link as NavLink } from "@/components/ui/Link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Flights" },
  { href: "/contact", label: "Contact" },
];

const utilityBadges = [
  { icon: BadgeCheck, text: "Best price guarantee" },
  { icon: ShieldCheck, text: "24/7 customer support" },
  { icon: Ticket, text: "Instant confirmation" },
  { icon: Clock3, text: "500+ airlines worldwide" },
];

const DEFAULT_BRAND_NAME = "Tiqwa Travel";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const brandName = settings?.name || DEFAULT_BRAND_NAME;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-aware shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [sidebarOpen]);

  return (
    <>
      {/* Fixed header: utility strip + flat nav bar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Utility strip */}
        <div className="hidden sm:block band-dark">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted sm:px-6 lg:px-8">
            {utilityBadges.map(({ icon: Icon, text }, i) => (
              <span key={text} className="flex items-center gap-1.5">
                {i > 0 && <span className="hidden md:inline h-3 w-px bg-ink-border" />}
                <Icon className="hidden md:inline h-3 w-3 text-primary" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Main nav */}
        <div
          className={`bg-background-card border-b border-border transition-shadow duration-300${
            scrolled ? " shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]" : ""
          }`}
        >
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
                <Plane className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <span className="font-heading text-base md:text-lg font-extrabold text-foreground">
                {brandName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  variant="nav"
                  active={pathname === link.href}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="rounded-full p-2 text-foreground/60 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Sun className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2">
                {isLoading ? null : isAuthenticated ? (
                  <>
                    <Button href="/dashboard" variant="outline" size="sm" shape="pill">
                      <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                      {user?.firstName || "Dashboard"}
                    </Button>
                    <Button size="sm" shape="pill" onClick={logout}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="outline" size="sm" shape="pill">
                      Login
                    </Button>
                    <Button href="/signup" size="sm" shape="pill">
                      Sign Up
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-full p-2 text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-primary md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-6 right-4 bottom-6 z-50 w-[320px] max-w-[calc(100%-2rem)] rounded-2xl glossy shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Sidebar gradient header strip */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-300 to-primary/50 flex-shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <Plane className="h-4 w-4" />
                  </div>
                  <span className="font-heading font-extrabold text-foreground">{brandName}</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full p-1.5 text-foreground/60 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex flex-col p-4 gap-1 flex-1">
                {navLinks.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-foreground/70 hover:bg-primary/8 hover:text-foreground"
                        }`}
                      >
                        {link.label}
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-border" />

              {/* Auth Buttons */}
              <div className="p-4 space-y-2 flex-shrink-0">
                {isLoading ? null : isAuthenticated ? (
                  <>
                    <Button href="/dashboard" variant="outline" className="w-full" onClick={() => setSidebarOpen(false)}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => { setSidebarOpen(false); logout(); }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="outline" className="w-full" onClick={() => setSidebarOpen(false)}>
                      Login
                    </Button>
                    <Button href="/signup" className="w-full" onClick={() => setSidebarOpen(false)}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="px-4 pb-4 flex-shrink-0">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-3 text-sm font-medium text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  >
                    {theme === "light" ? (
                      <><Moon className="h-4 w-4" /> Dark Mode</>
                    ) : (
                      <><Sun className="h-4 w-4" /> Light Mode</>
                    )}
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
