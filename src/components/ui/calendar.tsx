'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn('p-3', className)}
			classNames={{
				months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
				month: 'space-y-4',
				month_caption: 'flex justify-center pt-1 relative items-center',
				caption_label: 'text-sm font-medium',
				nav: 'space-x-1 flex items-center absolute inset-x-0 top-0 justify-between',
				button_previous: cn(buttonVariants({ variant: 'outline', shape: 'pill' }), 'h-7 w-7 bg-secondary border-transparent p-0 opacity-70 hover:opacity-100 absolute left-1'),
				button_next: cn(buttonVariants({ variant: 'outline', shape: 'pill' }), 'h-7 w-7 bg-secondary border-transparent p-0 opacity-70 hover:opacity-100 absolute right-1'),
				weekdays: 'flex',
				weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
				week: 'flex w-full mt-2',
				// day cell — full square, background painted here for range continuity
				day: cn(buttonVariants({ variant: 'ghost', shape: 'pill' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative'),
				range_start: 'bg-primary text-primary-foreground rounded-l-full rounded-r-none',
				range_end: 'bg-primary text-primary-foreground rounded-r-full rounded-l-none',
				range_middle: 'bg-accent text-accent-foreground rounded-none',
				selected: 'bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
				today: 'bg-accent text-accent-foreground rounded-full font-semibold',
				outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
				disabled: 'text-muted-foreground opacity-50',
				hidden: 'invisible',
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) => (orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />),
			}}
			{...props}
		/>
	);
}
Calendar.displayName = 'Calendar';

export { Calendar };
