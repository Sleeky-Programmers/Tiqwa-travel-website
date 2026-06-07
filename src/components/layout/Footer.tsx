import Link from "next/link";
import { Plane } from "lucide-react";
import { Container } from "@/components/ui/Container";

const footerLinks = {
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  Legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
  Explore: [
    { href: "/search", label: "Search Flights" },
    { href: "/results?from=New+York&to=London&departure=2026-07-01&passengers=1", label: "Popular Routes" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-primary/5 dark:bg-primary/10">
      <Container className="py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-primary">
              <Plane className="h-5 w-5" />
              Tiqwa Travel
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your gateway to the world. Find and book flights with ease.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tiqwa Travel. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
