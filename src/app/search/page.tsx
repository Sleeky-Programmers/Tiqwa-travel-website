"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { FlightSearchForm } from "@/components/features/FlightSearchForm";
import { Container } from "@/components/ui/Container";

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
    tripType,
  };

  return (
    <div className="page-fade-in py-16">
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold sm:text-4xl">Search Flights</h1>
          <p className="mt-3 text-muted-foreground">
            Find the perfect flight for your next trip
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FlightSearchForm defaultValues={defaultValues} />
        </motion.div>
      </Container>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-16">
          <p className="text-muted-foreground">Loading...</p>
        </Container>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
