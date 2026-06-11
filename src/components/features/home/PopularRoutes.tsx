"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Plane } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import type { FlightDeal } from "@/types/whitelabel";
import { formatFlightPrice, getFlightDeals } from "@/services/whitelabel-api";

interface RouteCard {
  id: string;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  price: number;
  currency: string;
  image?: string;
  badge?: string;
  tripType?: string;
  cabinClass?: string;
  departureDate?: string;
  returnDate?: string | null;
}

function mapDealsToRoutes(deals: FlightDeal[]): RouteCard[] {
  return deals
    .map((deal) => ({
      id: String(deal.id ?? `${deal.origin}-${deal.destination}`),
      from: deal.origin_city || deal.origin || "",
      to: deal.destination_city || deal.destination || "",
      fromCode: deal.origin || "",
      toCode: deal.destination || "",
      price: Number(deal.amount ?? 0),
      currency: deal.currency || "NGN",
      image: deal.airline_logo || deal.image,
      badge: "Deal",
      tripType: deal.return_date ? "Round trip" : "One way",
      cabinClass: deal.cabin || "Economy",
      departureDate: deal.departure_date,
      returnDate: deal.return_date,
    }))
    .filter((route) => route.from && route.to && route.fromCode && route.toCode);
}

const badgeColors: Record<string, string> = {
  Deal: "bg-primary/10 text-primary",
};

function SectionHeader({ subtitle }: { subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10 text-center"
    >
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Popular Flight Routes
      </h2>
      <p className="mt-3 text-muted-foreground">
        {subtitle ?? "Explore our most booked destinations at unbeatable prices"}
      </p>
    </motion.div>
  );
}

export function PopularRoutes() {
  const router = useRouter();
  const [deals, setDeals] = useState<FlightDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const defaultDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

  useEffect(() => {
    async function fetchDeals() {
      try {
        const data = await getFlightDeals();
        setDeals(data ?? []);
      } catch {
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const routes = mapDealsToRoutes(deals);

  const handleRouteClick = (route: RouteCard) => {
    const params = new URLSearchParams({
      from: `${route.from} (${route.fromCode})`,
      to: `${route.to} (${route.toCode})`,
      departure: route.departureDate ?? defaultDate,
      passengers: "1",
      tripType: route.returnDate ? "roundtrip" : "oneway",
    });
    if (route.returnDate) {
      params.set("returnDate", route.returnDate);
    }
    router.push(`/results?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <section className="py-20">
        <Container>
          <SectionHeader subtitle="Loading deals..." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="glossy-card h-64" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (!routes.length) {
    return (
      <section className="py-20">
        <Container>
          <SectionHeader subtitle="No promotional deals available right now" />
          <div className="glossy-card mx-auto max-w-lg p-10 text-center">
            <Plane className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Check back soon for exclusive flight deals, or search for flights
              using the form above.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-20">
      <Container>
        <SectionHeader />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route, i) => (
            <motion.button
              key={route.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleRouteClick(route)}
              className="glossy-card glossy-hover group overflow-hidden text-left"
            >
              {route.image ? (
                <div className="relative h-36 w-full overflow-hidden bg-muted/30">
                  <Image
                    src={route.image}
                    alt={`${route.from} to ${route.to}`}
                    fill
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                    unoptimized={
                      route.image.includes("cloudinary.com") ||
                      route.image.includes("tiqwa.com")
                    }
                  />
                  {route.badge && (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColors[route.badge] ?? badgeColors.Deal}`}
                    >
                      {route.badge}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center bg-primary/5">
                  <Plane className="h-10 w-10 text-primary/40" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{route.fromCode}</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>{route.toCode}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {route.from} → {route.to}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {formatFlightPrice(route.price, route.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {route.tripType}
                      {route.cabinClass ? ` · ${route.cabinClass}` : ""}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Plane className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </Container>
    </section>
  );
}
