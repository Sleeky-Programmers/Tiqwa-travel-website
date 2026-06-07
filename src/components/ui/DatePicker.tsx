"use client";

import { useId, useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  disablePast?: boolean;
  fromDate?: Date;
  className?: string;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function DatePicker({
  label,
  value = "",
  onChange,
  placeholder = "Pick a date",
  required,
  disabled,
  disablePast = true,
  fromDate,
  className,
}: DatePickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);

  const minDate = useMemo(() => {
    if (fromDate) {
      const d = new Date(fromDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (disablePast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    return undefined;
  }, [fromDate, disablePast]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            "inline-flex h-10 w-full items-center justify-start gap-2 rounded-xl border border-border bg-white/60 px-4 text-sm font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={minDate ? { before: minDate } : undefined}
            defaultMonth={selected ?? minDate}
          />
        </PopoverContent>
      </Popover>
      {required && (
        <input
          type="text"
          value={value}
          required
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onChange={() => {}}
        />
      )}
    </div>
  );
}
