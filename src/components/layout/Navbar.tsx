"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Moon, Plane, Sun, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Floaty Navbar - Centered, curved edges, not full width */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="w-full max-w-7xl pointer-events-auto">
          <div className="glossy rounded-2xl shadow-xl">
            <nav className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 group"
              >
                <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-primary text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
                  <Plane className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-base md:text-lg font-bold text-foreground">
                  Tiqwa Travel
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1 lg:gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative rounded-lg px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "text-primary"
                          : "text-foreground/70 hover:text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                          transition={{ duration: 0.2 }}
                        />
                      )}
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
                    className="rounded-lg p-2 text-foreground/70 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  >
                    {theme === "light" ? (
                      <Moon className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <Sun className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Login
                  </Button>
                  <Button size="sm" className="rounded-full">
                    Sign Up
                  </Button>
                </div>

                {/* Sidebar Toggle Button (Mobile) */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-2 text-foreground/70 transition-all duration-300 hover:bg-primary/10 hover:text-primary md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Custom Sidebar - Curved edges, floaty, slides from right */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-6 right-4 bottom-6 z-50 w-[320px] max-w-[calc(100%-2rem)] rounded-2xl glossy shadow-2xl overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
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
                  className="rounded-lg p-1.5 text-foreground/60 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Navigation Links */}
              <div className="flex flex-col p-4 gap-1">
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
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:bg-primary/5 hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-border" />

              {/* Auth Buttons */}
              <div className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setSidebarOpen(false)}
                >
                  Login
                </Button>
                <Button
                  className="w-full rounded-xl"
                  onClick={() => setSidebarOpen(false)}
                >
                  Sign Up
                </Button>
              </div>

              {/* Theme Toggle in Sidebar (mobile) */}
              <div className="absolute bottom-6 left-6 right-6">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card-bg py-3 text-sm font-medium text-foreground/70 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20 md:h-24" />
    </>
  );
}


// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { Menu, Moon, Plane, Sun, X } from "lucide-react";
// import { motion, AnimatePresence } from "motion/react";
// import { useTheme } from "@/hooks/useTheme";
// import { Button } from "@/components/ui/Button";
// import { Container } from "@/components/ui/Container";

// const navLinks = [
//   { href: "/", label: "Home" },
//   { href: "/search", label: "Flights" },
//   { href: "/about", label: "About" },
//   { href: "/contact", label: "Contact" },
//   { href: "/faq", label: "FAQ" },
// ];

// export function Navbar() {
//   const pathname = usePathname();
//   const { theme, toggleTheme, mounted } = useTheme();
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
//       <Container>
//         <nav className="flex h-16 items-center justify-between">
//           <Link href="/" className="flex items-center gap-2 font-bold text-primary">
//             <Plane className="h-6 w-6" />
//             <span className="text-lg">Tiqwa Travel</span>
//           </Link>

//           <div className="hidden items-center gap-1 md:flex">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${
//                   pathname === link.href ? "text-primary" : "text-foreground"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>

//           <div className="flex items-center gap-2">
//             {mounted && (
//               <button
//                 onClick={toggleTheme}
//                 aria-label="Toggle theme"
//                 className="rounded-lg p-2 text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
//               >
//                 {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
//               </button>
//             )}
//             <div className="hidden items-center gap-2 sm:flex">
//               <Button variant="outline" size="sm">Login</Button>
//               <Button size="sm">Sign Up</Button>
//             </div>
//             <button
//               onClick={() => setMobileOpen(!mobileOpen)}
//               className="rounded-lg p-2 md:hidden"
//               aria-label="Toggle menu"
//             >
//               {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//             </button>
//           </div>
//         </nav>
//       </Container>

//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="overflow-hidden border-t border-white/20 md:hidden dark:border-white/10"
//           >
//             <Container className="flex flex-col gap-1 py-4">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   onClick={() => setMobileOpen(false)}
//                   className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 ${
//                     pathname === link.href ? "text-primary" : ""
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//               <div className="mt-2 flex gap-2 border-t border-border pt-4">
//                 <Button variant="outline" size="sm" className="flex-1">Login</Button>
//                 <Button size="sm" className="flex-1">Sign Up</Button>
//               </div>
//             </Container>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </header>
//   );
// }
