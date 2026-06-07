"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  label?: string;
  value?: { from: string; to: string };
  onChange?: (range: { from: string; to: string }) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = "Select dates",
  required,
  disabled,
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: value?.from ? new Date(value.from) : undefined,
    to: value?.to ? new Date(value.to) : undefined,
  });

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (onChange && range?.from) {
      onChange({
        from: format(range.from, "yyyy-MM-dd"),
        to: range.to ? format(range.to, "yyyy-MM-dd") : "",
      });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "inline-flex w-full items-center justify-start gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-normal transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>{format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}</>
            ) : (
              format(dateRange.from, "PPP")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glossy" align="start">
          <Calendar mode="range" selected={dateRange} onSelect={handleSelect} numberOfMonths={2} className="rounded-xl border-0" />
        </PopoverContent>
      </Popover>
    </div>
  );
}
