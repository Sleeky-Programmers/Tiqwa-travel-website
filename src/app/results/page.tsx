"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FlightCard } from "@/components/features/FlightCard";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  searchFlights,
  sortFlights,
  getAvailableAirlines,
  getPriceRange,
  type SortOption,
} from "@/services/flightSearch";

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const departure = searchParams.get("departure") ?? "";
  const passengers = Number(searchParams.get("passengers") ?? "1");
  const tripType = searchParams.get("tripType") ?? "";

  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const baseFlights = useMemo(
    () => searchFlights(from, to, {}),
    [from, to]
  );

  const priceRange = useMemo(() => getPriceRange(baseFlights), [baseFlights]);
  const airlines = useMemo(() => getAvailableAirlines(baseFlights), [baseFlights]);

  const effectiveMaxPrice = maxPrice ?? priceRange.max;

  const flights = useMemo(() => {
    const filtered = searchFlights(from, to, {
      maxPrice: effectiveMaxPrice,
      maxStops,
      airlines: selectedAirlines.length > 0 ? selectedAirlines : undefined,
    });
    return sortFlights(filtered, sortBy);
  }, [from, to, effectiveMaxPrice, maxStops, selectedAirlines, sortBy]);

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((a) => a !== airline)
        : [...prev, airline]
    );
  };

  const clearFilters = () => {
    setMaxPrice(undefined);
    setMaxStops(null);
    setSelectedAirlines([]);
  };

  const hasActiveFilters =
    maxPrice !== undefined || maxStops !== null || selectedAirlines.length > 0;

  const filterPanel = (
    <div className="glossy-card space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">
          Max Price: ${effectiveMaxPrice}
        </label>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={effectiveMaxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>${priceRange.min}</span>
          <span>${priceRange.max}</span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Stops</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: "Any", value: null },
            { label: "Non-stop", value: 0 },
            { label: "1 stop max", value: 1 },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setMaxStops(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                maxStops === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Airlines</p>
        <div className="mt-2 space-y-2">
          {airlines.map((airline) => (
            <label key={airline} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedAirlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
                className="accent-primary"
              />
              {airline}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-fade-in py-12">
      <Container>
        <Link
          href="/search"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Modify search
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Flight Results</h1>
              <p className="mt-1 text-muted-foreground">
                {from && to ? `${from} → ${to}` : "All available flights"}
                {departure && ` · ${departure}`}
                {tripType && ` · ${tripType}`}
                {` · ${passengers} passenger${passengers > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground lg:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-input bg-white/60 px-3 py-2 text-sm outline-none focus:border-primary dark:bg-white/5"
              >
                <option value="price">Price: Low to High</option>
                <option value="duration">Duration</option>
                <option value="departure">Departure Time</option>
              </select>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">{filterPanel}</aside>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden lg:hidden"
                >
                  <div className="relative mb-4">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="absolute right-3 top-3 rounded-lg p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {filterPanel}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              {flights.length === 0 ? (
                <div className="glossy-card p-12 text-center">
                  <p className="text-lg font-medium">No flights found</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                  <Link
                    href="/search"
                    className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Search again
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {flights.length} flight{flights.length > 1 ? "s" : ""} found
                  </p>
                  {flights.map((flight, i) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <FlightCard
                        flight={flight}
                        passengers={passengers}
                        departure={departure}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12">
          <p className="text-muted-foreground">Loading results...</p>
        </Container>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
