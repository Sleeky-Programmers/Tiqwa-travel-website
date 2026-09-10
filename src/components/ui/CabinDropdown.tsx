"use client";

import { useState } from "react";
import { Briefcase, Check, ChevronDown } from "lucide-react";
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
  value,
  onChange,
  className,
}: CabinDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected =
    CABIN_OPTIONS.find((opt) => opt.value === value) ?? CABIN_OPTIONS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-foreground/80 transition-colors outline-none hover:bg-primary/5 hover:text-foreground",
          className
        )}
      >
        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{selected.label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-44 rounded-2xl p-1.5 shadow-xl" align="start">
        {CABIN_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-primary/10",
              value === option.value && "bg-primary-light text-primary"
            )}
          >
            {option.label}
            {value === option.value && <Check className="h-3.5 w-3.5" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
