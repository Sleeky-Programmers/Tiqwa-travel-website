"use client";

import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Plane } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { popularRoutes } from "@/data/mockData";

const badgeColors: Record<string, string> = {
  "Best Deal": "bg-primary/10 text-primary",
  Trending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Luxury: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Adventure: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Business: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  Popular: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export function PopularRoutes() {
  const router = useRouter();
  const defaultDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const handleRouteClick = (from: string, to: string) => {
    const params = new URLSearchParams({
      from,
      to,
      departure: defaultDate,
      passengers: "1",
    });
    router.push(`/results?${params.toString()}`);
  };

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
            Popular Flight Routes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Explore our most booked destinations at unbeatable prices
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularRoutes.map((route, i) => (
            <motion.button
              key={route.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleRouteClick(route.from, route.to)}
              className="glossy-card glossy-hover group overflow-hidden text-left"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={route.image ?? ""}
                  alt={`${route.from} to ${route.to}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {route.badge && (
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColors[route.badge]}`}
                  >
                    {route.badge}
                  </span>
                )}
              </div>
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
                      ${route.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {route.tripType} · {route.cabinClass}
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
