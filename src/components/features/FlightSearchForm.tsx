"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";

interface FlightSearchFormProps {
  defaultValues?: {
    from?: string;
    to?: string;
    departure?: string;
    returnDate?: string;
    passengers?: string;
    tripType?: "oneway" | "roundtrip";
  };
}

export function FlightSearchForm({ defaultValues }: FlightSearchFormProps) {
  const router = useRouter();
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">(
    defaultValues?.tripType ?? "oneway"
  );
  const [from, setFrom] = useState(defaultValues?.from ?? "");
  const [to, setTo] = useState(defaultValues?.to ?? "");
  const [departure, setDeparture] = useState(defaultValues?.departure ?? "");
  const [returnDate, setReturnDate] = useState(defaultValues?.returnDate ?? "");
  const [passengers, setPassengers] = useState(defaultValues?.passengers ?? "1");

  // FIXED: Proper swap function using temp variable
  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleTripTypeChange = (type: "oneway" | "roundtrip") => {
    setTripType(type);
    if (type === "oneway") setReturnDate("");
  };

  const handleDepartureChange = (date: string) => {
    setDeparture(date);
    if (returnDate && date && returnDate < date) setReturnDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {
      from,
      to,
      departure,
      passengers,
      tripType,
    };
    if (tripType === "roundtrip" && returnDate) {
      params.returnDate = returnDate;
    }
    router.push(`/results?${new URLSearchParams(params).toString()}`);
  };

  const returnMinDate = departure ? new Date(departure) : new Date();

  return (
    <form
      onSubmit={handleSubmit}
      className="glossy rounded-2xl p-6 shadow-xl"
    >
      <div className="mb-6 flex gap-2 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => handleTripTypeChange("oneway")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tripType === "oneway"
              ? "bg-primary text-white shadow-md"
              : "text-foreground/70 hover:bg-primary/10"
          }`}
        >
          One Way
        </button>
        <button
          type="button"
          onClick={() => handleTripTypeChange("roundtrip")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tripType === "roundtrip"
              ? "bg-primary text-white shadow-md"
              : "text-foreground/70 hover:bg-primary/10"
          }`}
        >
          Round Trip
        </button>
      </div>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          tripType === "roundtrip" ? "lg:grid-cols-7" : "lg:grid-cols-6"
        }`}
      >
        <div className="relative">
          <Input
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="New York (JFK)"
            required
          />
        </div>

        <Input
          label="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="London (LHR)"
          required
        />

        <div className="hidden items-end lg:flex">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap cities"
            className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-primary/10 hover:text-primary"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
        </div>

        <DatePicker
          label="Departure Date"
          value={departure}
          onChange={handleDepartureChange}
          placeholder="Date"
          required
        />

        {tripType === "roundtrip" && (
          <DatePicker
            label="Return Date"
            value={returnDate}
            onChange={setReturnDate}
            placeholder="Date"
            required
            fromDate={returnMinDate}
          />
        )}

        <Input
          label="Passengers"
          type="number"
          min={1}
          max={9}
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
          required
        />

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button type="submit" className="w-full" size="lg">
            Search Flights
          </Button>
        </div>
      </div>
    </form>
  );
}