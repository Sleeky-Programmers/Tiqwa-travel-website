'use client';

import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useId, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateOfBirthPickerProps {
	label?: string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: { after: Date };
	className?: string;
}

function parseDate(value: string | undefined): Date | undefined {
	if (!value) return undefined;
	const parsed = parse(value, 'yyyy-MM-dd', new Date());
	return isValid(parsed) ? parsed : undefined;
}

function formatCompactDate(date: Date): string {
	return format(date, 'MMM dd, yyyy');
}

const CURRENT_YEAR = new Date().getFullYear();

export function DateOfBirthPicker({ label, value = '', onChange, placeholder = 'Select date of birth', required, disabled, className }: DateOfBirthPickerProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const selected = parseDate(value);

	const defaultMonth = selected || new Date(CURRENT_YEAR - 20, 0, 1);

	const handleSelect = (date: Date | undefined) => {
		if (date) {
			if (disabled && date > new Date()) return;
			onChange?.(format(date, 'yyyy-MM-dd'));
			setOpen(false);
		}
	};

	const handleClear = () => {
		onChange?.('');
	};

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			{label && (
				<label
					htmlFor={id}
					className="text-xs font-medium text-foreground">
					{label}
					{required && <span className="ml-1 text-primary">*</span>}
				</label>
			)}
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger
					id={id}
					className={cn(
						'inline-flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border bg-white/60 px-3 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10',
						!selected && 'text-muted-foreground'
					)}>
					<span className="flex items-center gap-2">
						<CalendarIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
						<span className="truncate">{selected ? formatCompactDate(selected) : placeholder}</span>
					</span>
					{selected && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleClear();
							}}
							className="text-muted-foreground hover:text-foreground">
							✕
						</button>
					)}
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0 glossy"
					align="start">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={handleSelect}
						disabled={disabled}
						defaultMonth={defaultMonth}
						captionLayout="dropdown"
						startMonth={new Date(1920, 0)}
						endMonth={new Date(CURRENT_YEAR, 11)}
						className="rounded-xl border-0"
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
