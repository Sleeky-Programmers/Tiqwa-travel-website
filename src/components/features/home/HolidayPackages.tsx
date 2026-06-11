"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { HolidayPackage } from "@/types/whitelabel";
import { formatFlightPrice } from "@/services/whitelabel-api";

interface HolidayPackagesProps {
  packages: HolidayPackage[];
}

export function HolidayPackages({ packages }: HolidayPackagesProps) {
  if (packages.length === 0) return null;

  return (
    <section className="py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Holiday Packages
          </h2>
          <p className="mt-3 text-muted-foreground">
            Curated getaways at exclusive prices
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.uniqueid}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={pkg.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glossy-card glossy-hover group block overflow-hidden"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={pkg.thumbnail}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">{pkg.location}</p>
                  <h3 className="mt-1 text-xl font-bold">{pkg.title}</h3>
                  {pkg.subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pkg.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-bold text-primary">
                      {formatFlightPrice(pkg.amount, pkg.currency)}
                    </p>
                    <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
