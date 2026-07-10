"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, helperText, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const field = (
      <InputPrimitive
        ref={ref}
        id={inputId}
        type={type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-input bg-white/60 px-4 py-2.5 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5",
          error && "border-destructive",
          className
        )}
        {...props}
      />
    );
    if (!label && !error && !helperText) return field;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-foreground">
            {label}
          </label>
        )}
        {field}
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };