'use client';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { DayPicker, useDayPicker, type Matcher } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateOfBirthPickerProps {
	label?: string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	/** Block dates after this (e.g. DOB can't be in the future). */
	disabled?: { after?: Date; before?: Date };
	/** Calendar year range — defaults to 1920–current year. Override for fields that need
	 *  future years (e.g. document expiry, which needs at least current year + 10). */
	minYear?: number;
	maxYear?: number;
	fieldDisabled?: boolean;
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(value: string | undefined): Date | undefined {
	if (!value) return undefined;
	const parsed = parse(value, 'yyyy-MM-dd', new Date());
	return isValid(parsed) ? parsed : undefined;
}

function formatCompactDate(date: Date): string {
	return format(date, 'MMM dd, yyyy');
}

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 1920;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Custom Dropdown ──────────────────────────────────────────────────────────

interface CustomSelectProps {
	value: number;
	options: { value: number; label: string }[];
	onChange: (value: number) => void;
	className?: string;
}

function CustomSelect({ value, options, onChange, className }: CustomSelectProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const selectedLabel = options.find((o) => o.value === value)?.label ?? String(value);

	// Close on outside click
	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
	};

	return (
		<div
			ref={ref}
			className={cn('relative', className)}
			onBlur={handleBlur}>
			{/* Trigger */}
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={cn(
					'flex h-7 items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-2.5',
					'text-xs font-medium text-foreground shadow-sm backdrop-blur-sm',
					'transition-all hover:border-primary/40 hover:bg-background',
					'focus:outline-none focus:ring-2 focus:ring-primary/20',
					open && 'border-primary/40 bg-background ring-2 ring-primary/20'
				)}
				aria-haspopup="listbox"
				aria-expanded={open}>
				<span>{selectedLabel}</span>
				<ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
			</button>

			{/* Dropdown list */}
			{open && (
				<div
					role="listbox"
					className={cn(
						'absolute left-0 top-full z-50 mt-1 max-h-48 w-max min-w-full overflow-y-auto rounded-xl',
						'border border-border/60 bg-popover shadow-lg backdrop-blur-sm',
						'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
					)}>
					{options.map((opt) => (
						<button
							key={opt.value}
							type="button"
							role="option"
							aria-selected={opt.value === value}
							onMouseDown={(e) => {
								// mousedown fires before blur, so we can safely update then close
								e.preventDefault();
								onChange(opt.value);
								setOpen(false);
							}}
							className={cn(
								'flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors',
								opt.value === value ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-accent'
							)}>
							{opt.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// ─── Custom Month Caption ──────────────────────────────────────────────────────
// Replaces the default caption so we get zero native <select> elements

function MonthCaption({ calendarMonth, minYear, maxYear }: { calendarMonth: { date: Date }; minYear: number; maxYear: number }) {
	const { goToMonth, previousMonth, nextMonth } = useDayPicker();

	const displayMonth = calendarMonth.date;
	const month = displayMonth.getMonth();
	const year = displayMonth.getFullYear();

	const monthOptions = MONTHS.map((label, i) => ({ value: i, label }));
	const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
		const y = maxYear - i;
		return { value: y, label: String(y) };
	});

	const handleMonthChange = (newMonth: number) => {
		goToMonth(new Date(year, newMonth, 1));
	};

	const handleYearChange = (newYear: number) => {
		goToMonth(new Date(newYear, month, 1));
	};

	return (
		<div className="flex items-center justify-between px-1 pt-1">
			{/* Prev */}
			<button
				type="button"
				onClick={() => previousMonth && goToMonth(previousMonth)}
				disabled={!previousMonth}
				className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:pointer-events-none')}
				aria-label="Previous month">
				<ChevronLeft className="h-4 w-4" />
			</button>

			{/* Month + Year selects */}
			<div className="flex items-center gap-1.5">
				<CustomSelect
					value={month}
					options={monthOptions}
					onChange={handleMonthChange}
				/>
				<CustomSelect
					value={year}
					options={yearOptions}
					onChange={handleYearChange}
					className="w-[68px]"
				/>
			</div>

			{/* Next */}
			<button
				type="button"
				onClick={() => nextMonth && goToMonth(nextMonth)}
				disabled={!nextMonth}
				className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:pointer-events-none')}
				aria-label="Next month">
				<ChevronRight className="h-4 w-4" />
			</button>
		</div>
	);
}

// ─── Inline Calendar (no shadcn wrapper needed) ────────────────────────────────

type CalendarProps = React.ComponentProps<typeof DayPicker> & { minYear: number; maxYear: number };

function Calendar({ className, classNames, showOutsideDays = true, minYear, maxYear, ...props }: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn('p-3', className)}
			classNames={{
				months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
				month: 'space-y-4',
				month_caption: 'flex justify-center pt-1 relative items-center h-10',
				caption_label: 'hidden', // hidden — MonthCaption renders its own
				nav: 'hidden', // hidden — MonthCaption renders its own nav
				weekdays: 'flex',
				weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
				week: 'flex w-full mt-2',
				day: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative'),
				range_start: 'bg-primary text-primary-foreground rounded-l-md rounded-r-none',
				range_end: 'bg-primary text-primary-foreground rounded-r-md rounded-l-none',
				range_middle: 'bg-accent text-accent-foreground rounded-none',
				selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
				today: 'bg-accent text-accent-foreground',
				outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
				disabled: 'text-muted-foreground opacity-50',
				hidden: 'invisible',
				...classNames,
			}}
			components={{
				MonthCaption: (props) => (
					<MonthCaption
						calendarMonth={props.calendarMonth}
						minYear={minYear}
						maxYear={maxYear}
					/>
				),
			}}
			{...props}
		/>
	);
}

// ─── DateOfBirthPicker ────────────────────────────────────────────────────────

export function DateOfBirthPicker({
	label,
	value = '',
	onChange,
	placeholder = 'Select date of birth',
	required,
	disabled,
	minYear = START_YEAR,
	maxYear = CURRENT_YEAR,
	fieldDisabled = false,
	className,
}: DateOfBirthPickerProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const selected = parseDate(value);
	const defaultMonth = selected || new Date(Math.min(Math.max(CURRENT_YEAR - 20, minYear), maxYear), 0, 1);

	// react-day-picker's combined { before; after } shape means "outside this range" (both
	// required together) — that's not what we want here, so each bound becomes its own matcher.
	const disabledMatchers: Matcher[] | undefined = disabled
		? [...(disabled.after ? [{ after: disabled.after }] : []), ...(disabled.before ? [{ before: disabled.before }] : [])]
		: undefined;

	const handleSelect = (date: Date | undefined) => {
		if (date) {
			if (disabled?.after && date > disabled.after) return;
			if (disabled?.before && date < disabled.before) return;
			onChange?.(format(date, 'yyyy-MM-dd'));
			setOpen(false);
		}
	};

	const handleClear = () => onChange?.('');

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			{label && (
				<label
					htmlFor={id}
					className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					{label}
					{required && <span className="ml-1 text-primary">*</span>}
				</label>
			)}

			<Popover
				open={open && !fieldDisabled}
				onOpenChange={(next) => !fieldDisabled && setOpen(next)}>
				<PopoverTrigger
					id={id}
					disabled={fieldDisabled}
					className={cn(
						'inline-flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border bg-white/60 px-3 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10',
						!selected && 'text-muted-foreground'
					)}>
					<span className="flex items-center gap-2">
						<CalendarIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
						<span className="truncate">{selected ? formatCompactDate(selected) : placeholder}</span>
					</span>
					{selected && !fieldDisabled && (
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
						disabled={disabledMatchers}
						defaultMonth={defaultMonth}
						startMonth={new Date(minYear, 0)}
						endMonth={new Date(maxYear, 11)}
						minYear={minYear}
						maxYear={maxYear}
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
