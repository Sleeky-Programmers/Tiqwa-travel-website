'use client';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';
import { DayButton, DayPicker, DropdownProps, getDefaultClassNames, Locale } from 'react-day-picker';

import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = 'label',
	buttonVariant = 'ghost',
	locale,
	formatters,
	components,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
	const defaultClassNames = getDefaultClassNames();

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn('group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)]', className)}
			captionLayout={captionLayout}
			locale={locale}
			formatters={{
				formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
				...formatters,
			}}
			classNames={{
				root: cn('w-fit', defaultClassNames.root),
				months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
				month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
				nav: cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1', defaultClassNames.nav),
				button_previous: cn(buttonVariants({ variant: buttonVariant }), 'size-(--cell-size) p-0 select-none aria-disabled:opacity-50', defaultClassNames.button_previous),
				button_next: cn(buttonVariants({ variant: buttonVariant }), 'size-(--cell-size) p-0 select-none aria-disabled:opacity-50', defaultClassNames.button_next),
				month_caption: cn('flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)', defaultClassNames.month_caption),
				dropdowns: cn('flex h-(--cell-size) w-full items-center justify-center gap-2 text-sm font-medium', defaultClassNames.dropdowns),
				dropdown_root: cn('relative', defaultClassNames.dropdown_root),
				caption_label: cn('font-medium select-none text-sm', defaultClassNames.caption_label),
				weekdays: cn('flex', defaultClassNames.weekdays),
				weekday: cn('flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none', defaultClassNames.weekday),
				week: cn('mt-2 flex w-full', defaultClassNames.week),
				day: cn('group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none', defaultClassNames.day),
				today: cn('rounded-(--cell-radius) bg-muted text-foreground', defaultClassNames.today),
				outside: cn('text-muted-foreground', defaultClassNames.outside),
				disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
				hidden: cn('invisible', defaultClassNames.hidden),
				...classNames,
			}}
			components={{
				Root: ({ className, rootRef, ...p }) => (
					<div
						data-slot="calendar"
						ref={rootRef}
						className={cn(className)}
						{...p}
					/>
				),
				Chevron: ({ className, orientation, ...p }) => {
					if (orientation === 'left')
						return (
							<ChevronLeftIcon
								className={cn('size-4', className)}
								{...p}
							/>
						);
					if (orientation === 'right')
						return (
							<ChevronRightIcon
								className={cn('size-4', className)}
								{...p}
							/>
						);
					return (
						<ChevronDownIcon
							className={cn('size-4', className)}
							{...p}
						/>
					);
				},
				DayButton: (p) => (
					<CalendarDayButton
						locale={locale}
						{...p}
					/>
				),
				Dropdown: CalendarDropdown,
				...components,
			}}
			{...props}
		/>
	);
}

function CalendarDropdown({ options, value, onChange, 'aria-label': ariaLabel }: DropdownProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const selectRef = React.useRef<HTMLSelectElement>(null);

	const handleChange = (val: string) => {
		onChange?.({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
		setIsOpen(false);
	};

	return (
		<div className="relative inline-flex">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-label={ariaLabel}
				className={cn(
					'h-7 w-fit min-w-[60px] rounded-md border border-input bg-transparent px-3 pr-7 text-sm font-medium',
					'hover:bg-accent hover:text-accent-foreground',
					'focus:ring-2 focus:ring-primary/20 focus:border-primary',
					'cursor-pointer inline-flex items-center justify-between gap-1'
				)}>
				<span>{options?.find((opt) => String(opt.value) === String(value))?.label || 'Select'}</span>
				<ChevronDownIcon className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
			</button>

			{isOpen && (
				<div
					className="absolute left-0 top-full z-50 mt-1 w-full min-w-[120px] overflow-y-auto rounded-md border border-border bg-background shadow-lg"
					style={{ maxHeight: '250px' }}>
					{options?.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => handleChange(String(option.value))}
							disabled={option.disabled}
							className={cn(
								'block w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
								String(value) === String(option.value) && 'bg-primary/10 text-primary',
								option.disabled && 'opacity-50 cursor-not-allowed'
							)}>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function CalendarDayButton({ className, day, modifiers, locale, ...props }: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
	const defaultClassNames = getDefaultClassNames();
	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			data-selected-single={modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle}
			className={cn(
				'relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
				defaultClassNames.day,
				className
			)}
			{...props}
		/>
	);
}

export { Calendar, CalendarDayButton };
