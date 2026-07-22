"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Menu, Moon, Plane, Sun, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Flights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
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
      {/* Floating Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none${scrolled ? " navbar-scrolled" : ""}`}
      >
        <div className="w-full max-w-7xl pointer-events-auto">
          <div
            className={`navbar-pill glossy rounded-2xl transition-shadow duration-300${
              scrolled
                ? " shadow-[0_8px_32px_-8px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)]"
                : " shadow-xl"
            }`}
          >
            <nav className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-primary text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
                  <Plane className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-base md:text-lg font-bold text-foreground">
                  Tiqwa Travel
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "text-foreground/70 hover:text-foreground hover:bg-foreground/6"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
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
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="rounded-full">
                          <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                          {user?.firstName || "Dashboard"}
                        </Button>
                      </Link>
                      <Button size="sm" onClick={logout} className="rounded-full">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" size="sm" className="rounded-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button size="sm" className="rounded-full">
                          Sign Up
                        </Button>
                      </Link>
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
              <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-primary/50 flex-shrink-0" />

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
                  <span className="font-bold text-foreground">Tiqwa Travel</span>
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
                    <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      className="w-full rounded-xl"
                      variant="outline"
                      onClick={() => { setSidebarOpen(false); logout(); }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setSidebarOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setSidebarOpen(false)}>
                      <Button className="w-full rounded-xl">Sign Up</Button>
                    </Link>
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
