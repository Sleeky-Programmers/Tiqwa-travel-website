'use client';

import { ArrowRightLeft, ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AirportCombobox } from '@/components/ui/AirportCombobox';
import { Button } from '@/components/ui/Button';
import { CabinDropdown } from '@/components/ui/CabinDropdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { getTotalPassengers, PassengerCounts, PassengerDropdown } from '@/components/ui/PassengerDropdown';
import { cn } from '@/lib/utils';
import { CabinClass, cacheFlightSearch, FlightSearchParams, parseAirportValue, searchFlightsForForm } from '@/services/whitelabel-api';

interface FlightSearchFormProps {
	defaultValues?: {
		from?: string;
		to?: string;
		departure?: string;
		returnDate?: string;
		passengers?: string;
		adults?: string;
		children?: string;
		infants?: string;
		cabin?: string;
		tripType?: 'oneway' | 'roundtrip';
	};
}

function formatAirportParam(display: string, code: string): string {
	if (display && code) return `${display} (${code})`;
	return code || display;
}

function parseCabin(value?: string): CabinClass {
	const cabins: CabinClass[] = ['economy', 'premium_economy', 'business', 'first'];
	if (value && cabins.includes(value as CabinClass)) {
		return value as CabinClass;
	}
	return 'economy';
}

function parsePassengerDefaults(defaultValues?: FlightSearchFormProps['defaultValues']): PassengerCounts {
	if (defaultValues?.adults) {
		return {
			adults: Math.max(1, Number(defaultValues.adults) || 1),
			children: Number(defaultValues.children ?? 0) || 0,
			infants: Number(defaultValues.infants ?? 0) || 0,
		};
	}

	const total = Number(defaultValues?.passengers ?? 1) || 1;
	return { adults: Math.max(1, total), children: 0, infants: 0 };
}

// Trip Type Dropdown Component
function TripTypeDropdown({ value, onChange }: { value: 'oneway' | 'roundtrip'; onChange: (type: 'oneway' | 'roundtrip') => void }) {
	const [open, setOpen] = useState(false);

	const options = [
		{ value: 'oneway', label: 'One Way' },
		{ value: 'roundtrip', label: 'Round Trip' },
	];

	const selectedLabel = options.find((opt) => opt.value === value)?.label || 'One Way';

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-medium text-foreground">Trip Type</span>
			<div className="relative">
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className="flex h-9 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-xs font-normal transition-all hover:bg-primary/5">
					<span>{selectedLabel}</span>
					<ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
				</button>
				{open && (
					<div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
						{options.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => {
									onChange(opt.value as 'oneway' | 'roundtrip');
									setOpen(false);
								}}
								className={cn('w-full px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10', value === opt.value && 'bg-primary/10 text-primary')}>
								{opt.label}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export function FlightSearchForm({ defaultValues }: FlightSearchFormProps) {
	const router = useRouter();
	const initialFrom = useMemo(() => parseAirportValue(defaultValues?.from), [defaultValues?.from]);
	const initialTo = useMemo(() => parseAirportValue(defaultValues?.to), [defaultValues?.to]);

	const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>(defaultValues?.tripType ?? 'oneway');
	const [fromCode, setFromCode] = useState(initialFrom.code);
	const [toCode, setToCode] = useState(initialTo.code);
	const [fromDisplay, setFromDisplay] = useState(initialFrom.display);
	const [toDisplay, setToDisplay] = useState(initialTo.display);
	const [departure, setDeparture] = useState(defaultValues?.departure ?? '');
	const [returnDate, setReturnDate] = useState(defaultValues?.returnDate ?? '');
	const [passengers, setPassengers] = useState<PassengerCounts>(() => parsePassengerDefaults(defaultValues));
	const [cabin, setCabin] = useState<CabinClass>(() => parseCabin(defaultValues?.cabin));
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSwap = () => {
		const tempDisplay = fromDisplay;
		const tempCode = fromCode;
		setFromDisplay(toDisplay);
		setFromCode(toCode);
		setToDisplay(tempDisplay);
		setToCode(tempCode);
	};

	const handleTripTypeChange = (type: 'oneway' | 'roundtrip') => {
		setTripType(type);
		if (type === 'oneway') setReturnDate('');
	};

	const handleDepartureChange = (date: string) => {
		setDeparture(date);
		if (returnDate && date && returnDate < date) setReturnDate('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!fromCode || !toCode) {
			setError('Please select departure and arrival airports from the list.');
			return;
		}

		setIsLoading(true);

		const searchParams: FlightSearchParams = {
			from: fromCode,
			to: toCode,
			departure,
			adults: passengers.adults,
			children: passengers.children,
			infants: passengers.infants,
			cabin,
			tripType,
			...(tripType === 'roundtrip' && returnDate ? { returnDate } : {}),
		};

		const result = await searchFlightsForForm(searchParams);

		if (result.success && result.flights) {
			cacheFlightSearch(result.flights, searchParams);

			const total = getTotalPassengers(passengers);
			const urlParams: Record<string, string> = {
				from: formatAirportParam(fromDisplay, fromCode),
				to: formatAirportParam(toDisplay, toCode),
				departure,
				adults: String(passengers.adults),
				children: String(passengers.children),
				infants: String(passengers.infants),
				passengers: String(total),
				cabin,
				tripType,
			};
			if (tripType === 'roundtrip' && returnDate) {
				urlParams.returnDate = returnDate;
			}

			// Check if user is on dashboard route
			const isDashboard = window.location.pathname.includes('/dashboard');
			const resultsPath = isDashboard ? '/dashboard/search/results' : '/results';

			router.push(`${resultsPath}?${new URLSearchParams(urlParams).toString()}`);
		} else {
			setError(result.error ?? 'Flight search failed. Please try again.');
		}

		setIsLoading(false);
	};

	const returnMinDate = departure ? new Date(departure) : new Date();

	return (
		<form
			onSubmit={handleSubmit}
			className="glossy rounded-2xl p-6 shadow-xl">
			{error && <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

			{/* Row 1: Trip Type, Cabin, Passengers - Takes 50% width on desktop */}
			<div className="mb-6 w-full lg:w-1/2">
				<div className="grid gap-4 sm:grid-cols-3">
					<TripTypeDropdown
						value={tripType}
						onChange={handleTripTypeChange}
					/>
					<CabinDropdown
						value={cabin}
						onChange={setCabin}
					/>
					<PassengerDropdown
						value={passengers}
						onChange={setPassengers}
					/>
				</div>
			</div>

			{/* Row 2: From, To, Departure Date, Return Date, Search Button - all on same row */}
			<div className={cn('grid gap-4', 'sm:grid-cols-2', tripType === 'roundtrip' ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
				{/* From Field with swap button on its right edge - visible on all devices */}
				<div className="relative">
					<AirportCombobox
						label="From"
						value={fromDisplay}
						selectedCode={fromCode}
						onSelect={(code, displayName) => {
							setFromCode(code);
							setFromDisplay(displayName);
						}}
						placeholder="Lagos, Nigeria"
						required
					/>
					{/* Swap button - visible on all devices, positioned between From and To */}
					<button
						type="button"
						onClick={handleSwap}
						aria-label="Swap cities"
						className="hidden absolute -right-5 top-[calc(50%+0.75rem)] z-10 md:flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-all hover:bg-primary/10 hover:text-primary">
						<ArrowRightLeft className="h-3 w-3" />
					</button>
				</div>

				<div className="relative md:hidden flex items-center justify-center">
					<button
						type="button"
						onClick={handleSwap}
						aria-label="Swap cities"
						className="md:hidden block absolute right-1/2 top-[calc(50%+0.75rem)] z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-all hover:bg-primary/10 hover:text-primary">
						<ArrowRightLeft className="h-3 w-3" />
					</button>
				</div>

				{/* To Field */}
				<AirportCombobox
					label="To"
					value={toDisplay}
					selectedCode={toCode}
					onSelect={(code, displayName) => {
						setToCode(code);
						setToDisplay(displayName);
					}}
					placeholder="Dubai, UAE"
					required
				/>

				{/* Departure Date */}
				<DatePicker
					label="Departure Date"
					value={departure}
					onChange={handleDepartureChange}
					placeholder="Select date"
					required
				/>

				{/* Return Date (only for round trip) */}
				{tripType === 'roundtrip' && (
					<DatePicker
						label="Return Date"
						value={returnDate}
						onChange={setReturnDate}
						placeholder="Select date"
						required
						fromDate={returnMinDate}
					/>
				)}

				{/* Search Button */}
				<div className="flex items-end">
					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={isLoading}>
						{isLoading ? (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							<>
								<Search className="h-4 w-4" />
								Search Flights
							</>
						)}
					</Button>
				</div>
			</div>
		</form>
	);
}
