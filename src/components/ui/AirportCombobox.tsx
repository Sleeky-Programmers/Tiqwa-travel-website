'use client';

import { ChevronsUpDown, Loader2, Plane, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getAirports } from '@/services/whitelabel-api';

import type { Airport } from '@/types/whitelabel';

interface AirportComboboxProps {
	label: string;
	value: string;
	selectedCode?: string;
	onSelect: (code: string, displayName: string) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
}

function sortAirports(airports: Airport[], query: string): Airport[] {
	const q = query.toLowerCase();
	return [...airports].sort((a, b) => {
		const aPopular = a.popular ? 1 : 0;
		const bPopular = b.popular ? 1 : 0;
		if (aPopular !== bPopular) return bPopular - aPopular;

		const aExact = a.city.toLowerCase() === q || a.iata_code.toLowerCase() === q || a.name.toLowerCase() === q;
		const bExact = b.city.toLowerCase() === q || b.iata_code.toLowerCase() === q || b.name.toLowerCase() === q;
		if (aExact !== bExact) return aExact ? -1 : 1;

		return a.city.localeCompare(b.city);
	});
}

export function AirportCombobox({ label, value, selectedCode, onSelect, placeholder = 'Search for a city...', required, disabled }: AirportComboboxProps) {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const suppressReopenRef = useRef(false);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState(value || '');
	const [airports, setAirports] = useState<Airport[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Keep the field's text mirroring the selected value whenever the user isn't actively editing it.
	useEffect(() => {
		if (!open) {
			setQuery(value || '');
		}
	}, [value, open]);

	useEffect(() => {
		if (!open) return;

		if (query.trim().length < 2) {
			setAirports([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		const timer = setTimeout(async () => {
			try {
				const data = await getAirports(query);
				setAirports(sortAirports(data, query.trim()));
			} catch {
				setAirports([]);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query, open]);

	const handleSelect = (airport: Airport) => {
		onSelect(airport.iata_code, airport.city);
		setQuery(airport.city);
		// Closing returns focus to the input (finalFocus below), which would otherwise
		// immediately re-trigger onFocus and pop the suggestions back open.
		suppressReopenRef.current = true;
		setOpen(false);
	};

	return (
		<div className="relative">
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<div className="relative">
					<label
						htmlFor={id}
						className="pointer-events-none absolute left-3 top-2 z-10 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						{label}
						{required && <span className="ml-1 text-primary">*</span>}
					</label>
					<PopoverTrigger
						nativeButton={false}
						render={
							<input
								id={id}
								ref={inputRef}
								type="text"
								autoComplete="off"
								value={query}
								disabled={disabled}
								placeholder={placeholder}
								onChange={(e) => {
									setQuery(e.target.value);
									if (!open) setOpen(true);
								}}
								onFocus={() => {
									if (suppressReopenRef.current) {
										suppressReopenRef.current = false;
										return;
									}
									setOpen(true);
								}}
								className={cn(
									'h-14 w-full rounded-xl border-0 bg-secondary/70 px-3 pb-1 pt-5 pr-8 text-sm font-semibold transition-all outline-none hover:bg-secondary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10'
								)}
							/>
						}
					/>
					<ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 shrink-0 opacity-50" />
				</div>
				<PopoverContent
					className="glossy w-[var(--anchor-width)] min-w-0 max-w-[calc(100vw-2rem)] rounded-2xl p-3"
					align="start"
					sideOffset={4}
					initialFocus={inputRef}
					finalFocus={inputRef}>
					<div className="relative mb-2">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							autoComplete="off"
							value={query}
							placeholder="Search airports..."
							onChange={(e) => setQuery(e.target.value)}
							className="h-11 w-full rounded-xl border-0 bg-secondary/70 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-white/5"
						/>
					</div>
					<div className="max-h-60 overflow-y-auto">
						{isLoading && (
							<div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Searching airports...
							</div>
						)}
						{!isLoading && query.trim().length < 2 && <p className="px-2 py-4 text-center text-xs text-muted-foreground">Type at least 2 characters to search</p>}
						{!isLoading && query.trim().length >= 2 && airports.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted-foreground">No airport found.</p>}
						{!isLoading &&
							airports.map((airport) => {
								const isSelected = selectedCode === airport.iata_code || value === airport.city;
								return (
									<button
										key={`${airport.iata_code}-${airport.id ?? airport.name}`}
										type="button"
										onClick={() => handleSelect(airport)}
										className={cn(
											'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors',
											isSelected ? 'bg-primary/10' : 'hover:bg-secondary/60'
										)}>
										<span
											className={cn(
												'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
												isSelected ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
											)}>
											<Plane className="h-4 w-4 -rotate-45" />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block text-sm">
												<span className="font-semibold text-foreground">{airport.city}</span>{' '}
												<span className={cn('font-semibold', isSelected ? 'text-primary' : 'text-muted-foreground')}>({airport.iata_code})</span>
											</span>
											<span className="block truncate text-xs text-muted-foreground">{airport.name}</span>
										</span>
									</button>
								);
							})}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
