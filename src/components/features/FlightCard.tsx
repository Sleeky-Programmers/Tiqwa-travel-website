"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Flight } from "@/types/flight";

interface FlightCardProps {
  flight: Flight;
  passengers?: number;
  departure?: string;
}

export function FlightCard({ flight, passengers = 1, departure = "" }: FlightCardProps) {
  const bookingParams = new URLSearchParams({
    flightId: flight.id,
    passengers: String(passengers),
    departure,
  });

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{flight.airline}</p>
          <p className="text-sm text-muted-foreground">{flight.from} → {flight.to}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>{flight.departure} – {flight.arrival}</span>
            <span>{flight.duration}</span>
            <span>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${flight.price}</p>
          <p className="text-xs text-muted-foreground">per person</p>
        </div>
        <Link href={`/booking?${bookingParams.toString()}`}>
          <Button size="sm">Select</Button>
        </Link>
      </div>
    </Card>
  );
}
