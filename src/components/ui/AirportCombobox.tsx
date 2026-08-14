"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  formatAirportLabel,
  getAirports,
} from "@/services/whitelabel-api";
import type { Airport } from "@/types/whitelabel";

interface AirportComboboxProps {
  label: string;
  value: string;
  selectedCode?: string;
  onSelect: (code: string, displayName: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

function sortAirports(airports: Airport[], query: string): Airport[] {
  const q = query.toLowerCase();
  return [...airports].sort((a, b) => {
    const aPopular = a.popular ? 1 : 0;
    const bPopular = b.popular ? 1 : 0;
    if (aPopular !== bPopular) return bPopular - aPopular;

    const aExact =
      a.city.toLowerCase() === q ||
      a.iata_code.toLowerCase() === q ||
      a.name.toLowerCase() === q;
    const bExact =
      b.city.toLowerCase() === q ||
      b.iata_code.toLowerCase() === q ||
      b.name.toLowerCase() === q;
    if (aExact !== bExact) return aExact ? -1 : 1;

    return a.city.localeCompare(b.city);
  });
}

export function AirportCombobox({
  label,
  value,
  selectedCode,
  onSelect,
  placeholder = "Search for a city...",
  required,
  disabled,
}: AirportComboboxProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const suppressReopenRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keep the field's text mirroring the selected value whenever the user isn't actively editing it.
  useEffect(() => {
    if (!open) {
      setQuery(value || "");
    }
  }, [value, open]);

  useEffect(() => {
    if (!open) return;

    if (query.trim().length < 2) {
      setAirports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getAirports(query);
        setAirports(sortAirports(data, query.trim()));
      } catch {
        setAirports([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (airport: Airport) => {
    onSelect(airport.iata_code, airport.city);
    setQuery(airport.city);
    // Closing returns focus to the input (finalFocus below), which would otherwise
    // immediately re-trigger onFocus and pop the suggestions back open.
    suppressReopenRef.current = true;
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger
            nativeButton={false}
            render={
              <input
                id={id}
                ref={inputRef}
                type="text"
                autoComplete="off"
                value={query}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!open) setOpen(true);
                }}
                onFocus={() => {
                  if (suppressReopenRef.current) {
                    suppressReopenRef.current = false;
                    return;
                  }
                  setOpen(true);
                }}
                className={cn(
                  "h-9 w-full rounded-xl border border-border bg-white/60 px-3 pr-8 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10"
                )}
              />
            }
          />
          <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 shrink-0 opacity-50" />
        </div>
        <PopoverContent
          className="glossy w-[var(--anchor-width)] min-w-[280px] p-0"
          align="start"
          sideOffset={4}
          initialFocus={inputRef}
          finalFocus={inputRef}
        >
          <div className="max-h-60 overflow-y-auto p-1">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching airports...
              </div>
            )}
            {!isLoading && query.trim().length < 2 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Type at least 2 characters to search
              </p>
            )}
            {!isLoading && query.trim().length >= 2 && airports.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No airport found.
              </p>
            )}
            {!isLoading &&
              airports.map((airport) => {
                const isSelected =
                  selectedCode === airport.iata_code ||
                  value === airport.city;
                return (
                  <button
                    key={`${airport.iata_code}-${airport.id ?? airport.name}`}
                    type="button"
                    onClick={() => handleSelect(airport)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-primary/10"
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-primary",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">
                        {formatAirportLabel(airport)}
                      </span>
                      <span className="ml-1 text-[11px] text-muted-foreground">
                        — {airport.country}
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
