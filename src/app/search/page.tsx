"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { FlightSearchForm } from "@/components/features/FlightSearchForm";
import { FlightTable } from "@/components/features/FlightTable";
import { Container } from "@/components/ui/Container";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Loader2 } from "lucide-react";

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
    <div className="page-fade-in py-28">
      <Container>
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
          className="mx-auto max-w-5xl"
        >
          <FlightSearchForm defaultValues={defaultValues} />
        </motion.div>

        <div className="mt-12">
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
