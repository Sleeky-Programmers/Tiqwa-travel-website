'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Input as InputPrimitive } from '@base-ui/react/input';

interface InputProps extends React.ComponentProps<'input'> {
	label?: string;
	error?: string;
	helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, id, helperText, required, ...props }, ref) => {
	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
	const field = (
		<InputPrimitive
			ref={ref}
			id={inputId}
			type={type}
			required={required}
			data-slot="input"
			className={cn(
				'h-12 w-full min-w-0 rounded-md border border-border/80 bg-background-card px-4 text-sm text-foreground shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 outline-none placeholder:text-muted-foreground/70 hover:border-foreground/25 hover:shadow-[0_3px_12px_rgba(15,23,42,0.06)] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:shadow-[0_0_0_1px_var(--primary),0_4px_14px_rgba(255,90,54,0.12)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5',
				error && 'border-destructive',
				className
			)}
			{...props}
		/>
	);
	if (!label && !error && !helperText) return field;
	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label
					htmlFor={inputId}
					className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					{label}
					{required && <span className="ml-1 text-primary">*</span>}
				</label>
			)}
			{field}
			{helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
});
Input.displayName = 'Input';
export { Input };
