"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import { FlightSearchForm } from "@/components/features/FlightSearchForm";
import { FlightTable } from "@/components/features/FlightTable";
import { Container } from "@/components/ui/Container";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Loader2 } from "lucide-react";
import { searchHeroBackgroundImage } from "@/utils/images";

function SearchContent() {
  const searchParams = useSearchParams();
  const tripTypeParam = searchParams.get("tripType");
  const tripType: "oneway" | "roundtrip" | undefined =
    tripTypeParam === "roundtrip" || tripTypeParam === "oneway"
      ? tripTypeParam
      : undefined;

  const defaultValues = {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    departure: searchParams.get("departure") ?? undefined,
    returnDate: searchParams.get("returnDate") ?? undefined,
    passengers: searchParams.get("passengers") ?? undefined,
    adults: searchParams.get("adults") ?? undefined,
    children: searchParams.get("children") ?? undefined,
    infants: searchParams.get("infants") ?? undefined,
    cabin: searchParams.get("cabin") ?? undefined,
    tripType,
  };

  return (
    <PublicLayout>
    <div className="page-fade-in">
      {/* Hero */}
      <section className="relative flex min-h-[100vh] items-center overflow-hidden pt-28 pb-16 sm:pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src={searchHeroBackgroundImage}
            alt="Commercial airplane taxiing toward the runway before takeoff"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/25" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Search Flights</h1>
            <p className="mt-3 text-white/80">
              Find the perfect flight for your next trip
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-8 max-w-5xl"
          >
            <FlightSearchForm defaultValues={defaultValues} />
          </motion.div>
        </Container>
      </section>

      <Container>
        <div className="pb-16">
          <h2 className="mb-6 text-2xl font-bold">Browse All Flights</h2>
          <FlightTable />
        </div>
      </Container>
    </div>
    </PublicLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PublicLayout>
                <Container className="flex min-h-[80vh] items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Container>
        </PublicLayout>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
