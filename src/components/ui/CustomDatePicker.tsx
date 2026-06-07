"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CustomDatePickerProps {
  label?: string;
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

function buildDisabledDays(fromDate?: Date, toDate?: Date): Matcher[] | undefined {
  const matchers: Matcher[] = [];
  if (fromDate) matchers.push({ before: fromDate });
  if (toDate) matchers.push({ after: toDate });
  return matchers.length > 0 ? matchers : undefined;
}

export function CustomDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  required,
  disabled,
  fromDate,
  toDate,
}: CustomDatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
  const disabledDays = React.useMemo(() => buildDisabledDays(fromDate, toDate), [fromDate, toDate]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange && selectedDate) onChange(selectedDate.toISOString().split("T")[0]);
    else if (onChange && !selectedDate) onChange("");
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
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glossy" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabledDays}
            defaultMonth={date ?? fromDate}
            className="rounded-xl border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
