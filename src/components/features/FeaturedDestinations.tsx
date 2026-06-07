"use client";

import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const destinations = [
  { city: "Paris", country: "France", description: "The City of Light awaits with art, cuisine, and romance.", price: "From $589", gradient: "from-blue-400/20 to-indigo-500/20" },
  { city: "Tokyo", country: "Japan", description: "Experience the perfect blend of tradition and innovation.", price: "From $899", gradient: "from-pink-400/20 to-rose-500/20" },
  { city: "Dubai", country: "UAE", description: "Luxury shopping, ultramodern architecture, and desert adventures.", price: "From $479", gradient: "from-amber-400/20 to-orange-500/20" },
  { city: "New York", country: "USA", description: "The city that never sleeps — culture, food, and skyline views.", price: "From $219", gradient: "from-emerald-400/20 to-teal-500/20" },
];

export function FeaturedDestinations() {
  return (
    <section className="py-20">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Destinations</h2>
          <p className="mt-3 text-muted-foreground">Explore our most popular cities around the world</p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((dest, i) => (
            <motion.div key={dest.city} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <Card className={`bg-gradient-to-br ${dest.gradient} h-full`}>
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{dest.country}</span>
                </div>
                <h3 className="text-xl font-bold">{dest.city}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{dest.description}</p>
                <p className="mt-4 font-semibold text-primary">{dest.price}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
