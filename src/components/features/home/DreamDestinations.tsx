"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { destinations as mockDestinations } from "@/data/mockData";
import type { PopularAirport } from "@/types/whitelabel";
import { getDestinationImage } from "@/utils/images";

interface DestinationCard {
  id: string;
  name: string;
  country: string;
  image: string;
  tag: string;
  priceFrom?: number;
}

interface DreamDestinationsProps {
  popularAirports?: PopularAirport[];
}

const tagColors: Record<string, string> = {
  Romantic: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Culture: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Luxury: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Tropical: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Urban: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Adventure: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Popular: "bg-primary/10 text-primary",
};

const tags = ["Popular", "Urban", "Tropical", "Culture", "Adventure", "Luxury"];

function mapAirportsToDestinations(
  airports: PopularAirport[]
): DestinationCard[] {
  return airports.map((airport, i) => ({
    id: airport.iata_code ?? `airport-${i}`,
    name: airport.city,
    country: airport.country,
    image:
      typeof airport.image === "string"
        ? airport.image
        : getDestinationImage(airport.city),
    tag: tags[i % tags.length],
  }));
}

export function DreamDestinations({
  popularAirports = [],
}: DreamDestinationsProps) {
  const router = useRouter();

  const destinations: DestinationCard[] =
    popularAirports.length > 0
      ? mapAirportsToDestinations(popularAirports)
      : mockDestinations.map((d) => ({
          id: d.id,
          name: d.name,
          country: d.country,
          image: d.image,
          tag: d.tag,
          priceFrom: d.priceFrom,
        }));

  const handleClick = (name: string, code?: string) => {
    const query = code ? `${name} (${code})` : name;
    router.push(`/search?to=${encodeURIComponent(query)}`);
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
            Dream Destinations
          </h2>
          <p className="mt-3 text-muted-foreground">
            From city breaks to tropical escapes
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, i) => (
            <motion.button
              key={dest.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() =>
                handleClick(
                  dest.name,
                  popularAirports.length > 0
                    ? popularAirports[i]?.iata_code
                    : undefined
                )
              }
              className="glossy-card glossy-hover group overflow-hidden text-left"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={dest.image.includes("cloudinary.com")}
                />
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagColors[dest.tag] ?? tagColors.Popular}`}
                >
                  {dest.tag}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{dest.country}</span>
                </div>
                <h3 className="mt-1 text-xl font-bold">{dest.name}</h3>
                {dest.priceFrom && (
                  <p className="mt-2 text-sm font-semibold text-primary">
                    From ${dest.priceFrom}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </Container>
    </section>
  );
}
