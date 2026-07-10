"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex items-center justify-centers py-2 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </div>
  );
}