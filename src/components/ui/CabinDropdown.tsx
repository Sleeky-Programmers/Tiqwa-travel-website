"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CabinClass } from "@/services/whitelabel-api";

const CABIN_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

interface CabinDropdownProps {
  label?: string;
  value: CabinClass;
  onChange: (value: CabinClass) => void;
  className?: string;
}

export function CabinDropdown({
  label = "Cabin",
  value,
  onChange,
  className,
}: CabinDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected =
    CABIN_OPTIONS.find((opt) => opt.value === value) ?? CABIN_OPTIONS[0];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="inline-flex h-9 w-full items-center justify-between rounded-xl border border-border bg-white/60 px-3 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <span>{selected.label}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="glossy w-44 p-1" align="start">
          {CABIN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10",
                value === option.value && "bg-primary/10 text-primary"
              )}
            >
              {option.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
