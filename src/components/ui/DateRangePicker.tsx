'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { DateRange } from 'react-day-picker';
interface DateRangePickerProps {
	label?: string;
	value?: { from: string; to: string };
	onChange?: (range: { from: string; to: string }) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
}

export function DateRangePicker({ label, value, onChange, placeholder = 'Select dates', required, disabled }: DateRangePickerProps) {
	// Parse the value prop into a DateRange object
	const getDateRangeFromValue = (val?: { from: string; to: string }): DateRange | undefined => {
		if (!val?.from) return undefined;
		return {
			from: new Date(val.from),
			to: val.to ? new Date(val.to) : undefined,
		};
	};

	const [dateRange, setDateRange] = React.useState<DateRange | undefined>(getDateRangeFromValue(value));
	const [open, setOpen] = React.useState(false);

	// Sync internal state when value prop changes
	React.useEffect(() => {
		setDateRange(getDateRangeFromValue(value));
	}, [value?.from, value?.to]);

	const handleSelect = (range: DateRange | undefined) => {
		setDateRange(range);
		if (onChange && range?.from) {
			onChange({
				from: format(range.from, 'yyyy-MM-dd'),
				to: range.to ? format(range.to, 'yyyy-MM-dd') : '',
			});
		}
		// Close popover after selection if both dates are selected
		if (range?.from && range?.to) {
			setOpen(false);
		}
	};

	const displayText = React.useMemo(() => {
		if (!dateRange?.from) return placeholder;
		if (dateRange.to) {
			return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
		}
		return format(dateRange.from, 'PPP');
	}, [dateRange, placeholder]);

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label className="text-sm font-medium text-foreground">
					{label}
					{required && <span className="ml-1 text-primary">*</span>}
				</label>
			)}
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger
					disabled={disabled}
					className={cn(
						'inline-flex h-9 w-full items-center justify-start gap-2 rounded-xl border border-border bg-background px-3 text-sm font-normal transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50',
						!dateRange?.from && 'text-muted-foreground'
					)}>
					<CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
					<span className="truncate">{displayText}</span>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0 glossy"
					align="start">
					<Calendar
						mode="range"
						selected={dateRange}
						onSelect={handleSelect}
						numberOfMonths={2}
						className="rounded-xl border-0"
						// initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
