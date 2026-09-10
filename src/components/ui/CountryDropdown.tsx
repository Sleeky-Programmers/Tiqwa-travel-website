'use client';

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getCountries } from '@/services/whitelabel-api';
import type { Country } from '@/types/whitelabel';

interface CountryDropdownProps {
	label: string;
	/** ISO2 country code (e.g. "NG"), matching what the booking payload expects. */
	value: string;
	onChange: (iso2: string) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
}

export function CountryDropdown({ label, value, onChange, placeholder = 'Select country', required, disabled }: CountryDropdownProps) {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [countries, setCountries] = useState<Country[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		getCountries()
			.then((data) => {
				if (!cancelled) setCountries(data);
			})
			.catch(() => {
				if (!cancelled) setCountries([]);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const selected = countries.find((c) => c.iso2 === value);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return countries;
		return countries.filter((c) => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase() === q);
	}, [countries, query]);

	const handleSelect = (country: Country) => {
		onChange(country.iso2);
		setQuery('');
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={id}
				className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
				{required && <span className="ml-1 text-primary">*</span>}
			</label>
			<Popover
				open={open}
				onOpenChange={(o) => {
					setOpen(o);
					if (!o) setQuery('');
				}}>
				<div className="relative">
					<PopoverTrigger
						nativeButton={false}
						render={
							<input
								id={id}
								ref={inputRef}
								type="text"
								autoComplete="off"
								required={required}
								value={open ? query : selected?.name ?? ''}
								disabled={disabled}
								placeholder={placeholder}
								onChange={(e) => setQuery(e.target.value)}
								onFocus={() => setOpen(true)}
								className="h-9 w-full rounded-xl border border-border bg-white/60 px-3 pr-8 text-xs font-normal transition-all outline-none hover:bg-white/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10"
							/>
						}
					/>
					<ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 shrink-0 opacity-50" />
				</div>
				<PopoverContent
					className="glossy w-[var(--anchor-width)] min-w-[280px] p-0"
					align="start"
					sideOffset={4}
					initialFocus={inputRef}
					finalFocus={inputRef}>
					<div className="max-h-60 overflow-y-auto p-1">
						{isLoading && (
							<div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Loading countries...
							</div>
						)}
						{!isLoading && filtered.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted-foreground">No country found.</p>}
						{!isLoading &&
							filtered.map((country) => (
								<button
									key={country.iso2}
									type="button"
									onClick={() => handleSelect(country)}
									className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-primary/10">
									<Check className={cn('h-3.5 w-3.5 shrink-0 text-primary', country.iso2 === value ? 'opacity-100' : 'opacity-0')} />
									<span className="min-w-0 flex-1">
										<span className="font-medium">{country.name}</span>
										<span className="ml-1 text-[11px] text-muted-foreground">({country.iso2})</span>
									</span>
								</button>
							))}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
