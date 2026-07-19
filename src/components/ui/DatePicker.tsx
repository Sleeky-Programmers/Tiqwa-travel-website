'use client';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
	const parsed = parse(value, 'yyyy-MM-dd', new Date());
	return isValid(parsed) ? parsed : undefined;
}

function formatCompactDate(date: Date): string {
	return format(date, 'MMM dd, yyyy');
}

export function DatePicker({ label, value = '', onChange, placeholder = 'Pick a date', required, disabled, disablePast = true, fromDate, className }: DatePickerProps) {
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
			onChange?.(format(date, 'yyyy-MM-dd'));
			setOpen(false);
		}
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
					disabled={disabled}
					className={cn(
						'inline-flex h-9 w-full items-center justify-start gap-2 rounded-xl border border-border bg-white/60 px-3 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10',
						!selected && 'text-muted-foreground'
					)}>
					<CalendarIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
					<span className="truncate">{selected ? formatCompactDate(selected) : placeholder}</span>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={handleSelect}
						disabled={minDate ? { before: minDate } : undefined}
						defaultMonth={selected ?? minDate}
						classNames={{
							month_caption: 'flex justify-center pt-1 relative items-center h-10',
							caption_label: 'text-sm font-medium',
							nav: 'absolute inset-x-0 mt-3 mx-auto top-0 flex items-center justify-between h-10 px-2',
							button_previous:
								'h-7 w-7 flex items-center justify-center bg-transparent p-0 opacity-50 hover:opacity-100 rounded border border-transparent hover:border-border z-[200]',
							button_next:
								'h-7 w-7 flex items-center justify-center bg-transparent p-0 opacity-50 hover:opacity-100 rounded border border-transparent hover:border-border z-[200]',
						}}
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
