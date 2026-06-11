"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  cacheSelectedFlight,
  formatFlightPrice,
  getAllFlights,
  getDefaultBrowseDate,
} from "@/services/whitelabel-api";
import type { Flight } from "@/types/flight";
import { getFlightStops } from "@/types/flight";

const PAGE_SIZE = 10;

export function FlightTable() {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [departureDate] = useState(getDefaultBrowseDate);

  const loadFlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await getAllFlights();
      setFlights(results);
      setPage(1);
    } catch (err) {
      setFlights([]);
      setError(err instanceof Error ? err.message : "Failed to load flights");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  const totalPages = Math.max(1, Math.ceil(flights.length / PAGE_SIZE));

  const paginatedFlights = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return flights.slice(start, start + PAGE_SIZE);
  }, [flights, page]);

  const handleSelect = (flight: Flight) => {
    cacheSelectedFlight(flight);
    const params = new URLSearchParams({
      flightId: flight.id,
      departure: departureDate,
      passengers: "1",
    });
    router.push(`/booking?${params.toString()}`);
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  if (isLoading) {
    return (
      <div className="glossy-card overflow-hidden">
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <div className="divide-y divide-border border-t border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              {Array.from({ length: 6 }).map((__, j) => (
                <div
                  key={j}
                  className="h-4 flex-1 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glossy-card flex flex-col items-center gap-4 p-12 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={loadFlights}>
          Retry
        </Button>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="glossy-card p-12 text-center">
        <p className="text-lg font-medium">No flights available</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back later or use the search form above.
        </p>
      </div>
    );
  }

  return (
    <div className="glossy-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-3 font-semibold">Airline</th>
              <th className="px-4 py-3 font-semibold">Flight</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Stops</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFlights.map((flight) => {
              const stops = getFlightStops(flight);
              return (
              <tr
                key={flight.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5"
              >
                <td className="px-4 py-3 font-medium">{flight.airline}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {flight.flightNumber ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">
                    {flight.fromCode ?? flight.from}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {flight.departure}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">
                    {flight.toCode ?? flight.to}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {flight.arrival}
                  </span>
                </td>
                <td className="px-4 py-3">{flight.duration}</td>
                <td className="px-4 py-3">
                  {stops === 0
                    ? "Non-stop"
                    : `${stops} stop${stops > 1 ? "s" : ""}`}
                </td>
                <td className="px-4 py-3 font-semibold text-primary">
                  {formatFlightPrice(flight.price, flight.currency)}
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" onClick={() => handleSelect(flight)}>
                    Select
                  </Button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, flights.length)} of {flights.length} flights
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
            className={'py-4'}
            >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {pageNumbers.map((pageNum) => (
            <button
            key={pageNum}
            type="button"
            onClick={() => setPage(pageNum)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
              pageNum === page
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
            >
              {pageNum}
            </button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
            className={'py-4'}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
