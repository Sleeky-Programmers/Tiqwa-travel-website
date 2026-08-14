"use client";

import { useState } from "react";
import { ChevronsUpDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerDropdownProps {
  label?: string;
  value: PassengerCounts;
  onChange: (value: PassengerCounts) => void;
  className?: string;
}

export function getPassengerDisplayText(value: PassengerCounts): string {
  const parts: string[] = [];
  if (value.adults > 0) {
    parts.push(`${value.adults} Adult${value.adults > 1 ? "s" : ""}`);
  }
  if (value.children > 0) {
    parts.push(`${value.children} Child${value.children > 1 ? "ren" : ""}`);
  }
  if (value.infants > 0) {
    parts.push(`${value.infants} Infant${value.infants > 1 ? "s" : ""}`);
  }
  return parts.join(", ") || "1 Adult";
}

export function getTotalPassengers(value: PassengerCounts): number {
  return value.adults + value.children + value.infants;
}

export function PassengerDropdown({
  label = "Passengers",
  value,
  onChange,
  className,
}: PassengerDropdownProps) {
  const [open, setOpen] = useState(false);
  const totalPassengers = getTotalPassengers(value);

  const updateCount = (type: keyof PassengerCounts, delta: number) => {
    const current = value[type];
    const newCount = current + delta;

    if (newCount < 0) return;
    if (type === "adults" && newCount < 1) return;
    if (totalPassengers + delta > 9) return;

    // Each infant must travel on an adult's lap, so infants can never outnumber adults.
    if (type === "infants" && newCount > value.adults) return;

    if (type === "adults" && newCount < value.infants) {
      // Reducing adults below the current infant count — bring infants down to match.
      onChange({ ...value, adults: newCount, infants: newCount });
      return;
    }

    onChange({ ...value, [type]: newCount });
  };

  const infantsAtLimit = value.infants >= value.adults;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-9 w-full items-center justify-between rounded-xl border border-border bg-white/60 px-3 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-white/5 dark:hover:bg-white/10",
            !totalPassengers && "text-muted-foreground"
          )}
        >
          <span className="truncate">{getPassengerDisplayText(value)}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="glossy w-72 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Adults</span>
                <span className="ml-1 text-xs text-muted-foreground">(12+ yrs)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateCount("adults", -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-primary/10"
                  aria-label="Decrease adults"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">
                  {value.adults}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount("adults", 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-primary/10"
                  aria-label="Increase adults"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Children</span>
                <span className="ml-1 text-xs text-muted-foreground">(2-11 yrs)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateCount("children", -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-primary/10"
                  aria-label="Decrease children"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">
                  {value.children}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount("children", 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-primary/10"
                  aria-label="Increase children"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Infants</span>
                <span className="ml-1 text-xs text-muted-foreground">(0-2 yrs)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateCount("infants", -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-primary/10"
                  aria-label="Decrease infants"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">
                  {value.infants}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount("infants", 1)}
                  disabled={infantsAtLimit}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  aria-label="Increase infants"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="-mt-2 text-[11px] text-muted-foreground">
              Each infant must sit on an adult&apos;s lap — infants can&apos;t exceed the number of adults.
            </p>

            <div className="border-t border-border pt-2 text-xs text-muted-foreground">
              Max 9 passengers total
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
