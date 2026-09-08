"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus, User } from "lucide-react";
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-foreground/80 transition-colors outline-none hover:bg-primary/5 hover:text-foreground",
          className
        )}
      >
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate">{getPassengerDisplayText(value)}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-2xl p-4 shadow-xl" align="start">
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
  );
}
