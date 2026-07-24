'use client';

import { ArrowLeft, Building, ChevronLeft, ChevronRight, Clock, Filter, Loader2, Plane, SlidersHorizontal, SortAsc, Users, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { FlightCard } from '@/components/features/FlightCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Link, linkVariants } from '@/components/ui/Link';
import { cn } from '@/lib/utils';
import { applyFlightFilters, getAvailableAirlines, getPriceRange, sortFlights, SortOption } from '@/services/flightSearch';
import {
	CabinClass,
	extractAirportCode,
	FlightSearchParams,
	formatFlightPrice,
	getTotalPassengers,
	readCachedFlightSearch,
	searchFlightsForForm,
} from '@/services/whitelabel-api';

import type { Flight, StopsFilter } from '@/types/flight';
const CABIN_LABELS: Record<CabinClass, string> = {
	economy: 'Economy',
	premium_economy: 'Premium Economy',
	business: 'Business',
	first: 'First Class',
};

function parseCabin(value: string | null): CabinClass {
	const cabins: CabinClass[] = ['economy', 'premium_economy', 'business', 'first'];
	if (value && cabins.includes(value as CabinClass)) {
		return value as CabinClass;
	}
	return 'economy';
}

function parsePassengersFromUrl(searchParams: URLSearchParams) {
	const adultsParam = searchParams.get('adults');
	if (adultsParam) {
		return {
			adults: Math.max(1, Number(adultsParam) || 1),
			children: Number(searchParams.get('children') ?? 0) || 0,
			infants: Number(searchParams.get('infants') ?? 0) || 0,
		};
	}

	const total = Number(searchParams.get('passengers') ?? '1') || 1;
	return { adults: Math.max(1, total), children: 0, infants: 0 };
}

function paramsMatchCache(
	cached: FlightSearchParams,
	from: string,
	to: string,
	departure: string,
	returnDate: string,
	tripType: string,
	adults: number,
	children: number,
	infants: number,
	cabin: CabinClass
): boolean {
	return (
		extractAirportCode(cached.from) === extractAirportCode(from) &&
		extractAirportCode(cached.to) === extractAirportCode(to) &&
		cached.departure === departure &&
		(cached.returnDate ?? '') === returnDate &&
		cached.tripType === (tripType === 'roundtrip' ? 'roundtrip' : 'oneway') &&
		cached.adults === adults &&
		cached.children === children &&
		cached.infants === infants &&
		cached.cabin === cabin
	);
}

const FLIGHTS_PER_PAGE = 100;

function ResultsContent() {
	const searchParams = useSearchParams();
	const to = searchParams.get('to') ?? '';
	const from = searchParams.get('from') ?? '';
	const departure = searchParams.get('departure') ?? '';
	const returnDate = searchParams.get('returnDate') ?? '';
	const { adults, children, infants } = parsePassengersFromUrl(searchParams);
	const totalPassengers = getTotalPassengers({ adults, children, infants });
	const cabin = parseCabin(searchParams.get('cabin'));
	const tripType = searchParams.get('tripType') ?? 'oneway';

	const [baseFlights, setBaseFlights] = useState<Flight[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [sortBy, setSortBy] = useState<SortOption>('price');
	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
	const [stopsFilter, setStopsFilter] = useState<StopsFilter>('any');
	const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);

	const loadFlights = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		setCurrentPage(1);

		const cached = readCachedFlightSearch();
		if (cached && paramsMatchCache(cached.params, from, to, departure, returnDate, tripType, adults, children, infants, cabin)) {
			setBaseFlights(cached.flights);
			setIsLoading(false);
			return;
		}

		if (!from || !to || !departure) {
			setBaseFlights([]);
			setIsLoading(false);
			return;
		}

		const params: FlightSearchParams = {
			from: extractAirportCode(from),
			to: extractAirportCode(to),
			departure,
			adults,
			children,
			infants,
			cabin,
			tripType: tripType === 'roundtrip' ? 'roundtrip' : 'oneway',
			...(returnDate ? { returnDate } : {}),
		};

		const result = await searchFlightsForForm(params);

		if (result.success && result.flights) {
			setBaseFlights(result.flights);
		} else {
			setError(result.error ?? 'Flight search failed');
			setBaseFlights([]);
		}

		setIsLoading(false);
	}, [from, to, departure, returnDate, adults, children, infants, cabin, tripType]);

	useEffect(() => {
		loadFlights();
	}, [loadFlights]);

	const priceRange = useMemo(() => getPriceRange(baseFlights), [baseFlights]);
	const airlines = useMemo(() => getAvailableAirlines(baseFlights), [baseFlights]);
	const displayCurrency = baseFlights[0]?.currency ?? 'NGN';

	const effectiveMaxPrice = maxPrice ?? priceRange.max;

	const filteredFlights = useMemo(() => {
		const filtered = applyFlightFilters(baseFlights, {
			maxPrice: maxPrice !== undefined ? maxPrice : undefined,
			stopsFilter,
			airlines: selectedAirlines.length > 0 ? selectedAirlines : undefined,
		});
		return sortFlights(filtered, sortBy);
	}, [baseFlights, maxPrice, stopsFilter, selectedAirlines, sortBy]);

	const totalPages = Math.ceil(filteredFlights.length / FLIGHTS_PER_PAGE);
	const paginatedFlights = useMemo(() => {
		const start = (currentPage - 1) * FLIGHTS_PER_PAGE;
		const end = start + FLIGHTS_PER_PAGE;
		return filteredFlights.slice(start, end);
	}, [filteredFlights, currentPage]);

	const toggleAirline = (airline: string) => {
		setSelectedAirlines((prev) => (prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]));
		setCurrentPage(1);
	};

	const clearFilters = () => {
		setMaxPrice(undefined);
		setStopsFilter('any');
		setSelectedAirlines([]);
		setCurrentPage(1);
	};

	const handleSortChange = (value: SortOption) => {
		setSortBy(value);
		setCurrentPage(1);
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const hasActiveFilters = maxPrice !== undefined || stopsFilter !== 'any' || selectedAirlines.length > 0;

	const filterPanel = (
		<div className="rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-6 sticky top-24 dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<h3 className="font-semibold">Filters</h3>
				</div>
				{hasActiveFilters && (
					<button
						onClick={clearFilters}
						className={linkVariants({ variant: 'default', className: 'text-xs flex items-center gap-1' })}>
						<X className="h-3 w-3" />
						Clear all
					</button>
				)}
			</div>

			{/* Price Range */}
			<div>
				<div className="flex items-center justify-between">
					<label className="text-sm font-medium">Max Price</label>
					<span className="text-sm font-semibold text-primary">{formatFlightPrice(effectiveMaxPrice, displayCurrency)}</span>
				</div>
				<input
					type="range"
					min={priceRange.min}
					max={priceRange.max}
					value={effectiveMaxPrice}
					onChange={(e) => {
						setMaxPrice(Number(e.target.value));
						setCurrentPage(1);
					}}
					className="mt-2 w-full h-1.5 rounded-full bg-primary/20 appearance-none accent-primary cursor-pointer"
					style={{
						background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
							((effectiveMaxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100
						}%, rgba(37,99,235,0.2) ${((effectiveMaxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, rgba(37,99,235,0.2) 100%)`,
					}}
				/>
				<div className="mt-1 flex justify-between text-xs text-muted-foreground">
					<span>{formatFlightPrice(priceRange.min, displayCurrency)}</span>
					<span>{formatFlightPrice(priceRange.max, displayCurrency)}</span>
				</div>
			</div>

			{/* Stops */}
			<div>
				<p className="text-sm font-medium mb-2">Stops</p>
				<div className="flex flex-wrap gap-1.5">
					{(
						[
							{ label: 'Any', value: 'any' as const },
							{ label: 'Non-stop', value: 'nonstop' as const },
							{ label: '1 stop max', value: 'one-stop-max' as const },
						] as const
					).map((opt) => (
						<button
							key={opt.label}
							type="button"
							onClick={() => {
								setStopsFilter(opt.value);
								setCurrentPage(1);
							}}
							className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
								stopsFilter === opt.value
									? 'bg-primary text-white shadow-lg shadow-primary/25'
									: 'bg-secondary/60 text-secondary-foreground hover:bg-primary/10 hover:text-primary'
							}`}>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{/* Airlines */}
			<div>
				<p className="text-sm font-medium mb-2">Airlines</p>
				<div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
					{airlines.length === 0 ? (
						<p className="text-xs text-muted-foreground">No airlines available</p>
					) : (
						airlines.map((airline) => (
							<label
								key={airline}
								className="flex items-center gap-2.5 text-sm p-1.5 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
								<input
									type="checkbox"
									checked={selectedAirlines.includes(airline)}
									onChange={() => toggleAirline(airline)}
									className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
								/>
								<Building className="h-3.5 w-3.5 text-muted-foreground" />
								<span>{airline}</span>
							</label>
						))
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-6 page-transition">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Flight Results</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<Plane className="h-4 w-4" />
						{from && to ? `${from} → ${to}` : 'Search for flights'}
						{departure && ` · ${departure}`}
						{returnDate && ` · Return ${returnDate}`}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						<Users className="h-3 w-3" />
						{totalPassengers} {totalPassengers > 1 ? 'passengers' : 'passenger'}
					</div>
					<div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						<Plane className="h-3 w-3" />
						{CABIN_LABELS[cabin]}
					</div>
				</div>
			</div>

			{/* Back to Search */}
			<Link href="/dashboard/search" variant="back">
				Modify search
			</Link>

			{/* Error State */}
			{error && (
				<div className="flex flex-col gap-3 rounded-2xl bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 text-destructive">
							<X className="h-5 w-5" />
						</div>
						<p className="text-sm text-destructive">{error}</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						shape="pill"
						onClick={loadFlights}
						className="hover:bg-destructive/10 hover:text-destructive">
						Retry search
					</Button>
				</div>
			)}

			{/* Controls Bar */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						shape="pill"
						className="lg:hidden hover:bg-primary/10 hover:text-primary"
						onClick={() => setShowFilters(!showFilters)}>
						<SlidersHorizontal className="h-4 w-4 mr-1.5" />
						Filters
						{hasActiveFilters && (
							<span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
								{selectedAirlines.length + (stopsFilter !== 'any' ? 1 : 0) + (maxPrice !== undefined ? 1 : 0)}
							</span>
						)}
					</Button>
					<p className="text-sm text-muted-foreground hidden sm:block">
						{filteredFlights.length} flight{filteredFlights.length > 1 ? 's' : ''} found
					</p>
				</div>
				<div className="flex items-center gap-2">
					<SortAsc className="h-4 w-4 text-muted-foreground" />
					<select
						value={sortBy}
						onChange={(e) => handleSortChange(e.target.value as SortOption)}
						className="rounded-full border border-border/60 bg-white/60 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5">
						<option value="price">Price: Low to High</option>
						<option value="duration">Duration</option>
						<option value="departure">Departure Time</option>
					</select>
				</div>
			</div>

			{/* Main Grid */}
			<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
				{/* Sidebar - Filters */}
				<aside className="hidden lg:block">{filterPanel}</aside>

				{/* Mobile Filters */}
				<AnimatePresence>
					{showFilters && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="overflow-hidden lg:hidden">
							<div className="relative mb-4">
								<button
									onClick={() => setShowFilters(false)}
									className="absolute right-3 top-3 rounded-lg p-1.5 hover:bg-primary/10 hover:text-primary transition-colors">
									<X className="h-4 w-4" />
								</button>
								{filterPanel}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				<div id="results-section">
					{isLoading ? (
						<div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
							<div className="relative mx-auto mb-4 h-12 w-12">
								<div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
								<Plane className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
							</div>
							<p className="font-medium">Searching for flights...</p>
							<p className="mt-1 text-sm text-muted-foreground">Finding the best options for you</p>
						</div>
					) : paginatedFlights.length === 0 ? (
						<div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/8">
								<Plane className="h-8 w-8 text-primary/40" />
							</div>
							<p className="text-lg font-semibold">No flights found</p>
							<p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
								Try adjusting your search or filters. Use airport codes like LOS or DXB for better results.
							</p>
							<Button
								href="/dashboard/search"
								shape="pill"
								className="mt-4 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:scale-105">
								Search again
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<>
							{/* Results count */}
							<div className="mb-4 flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									Showing {(currentPage - 1) * FLIGHTS_PER_PAGE + 1}-{Math.min(currentPage * FLIGHTS_PER_PAGE, filteredFlights.length)} of {filteredFlights.length}{' '}
									flights
								</p>
							</div>

							{/* Flight List */}
							<div className="space-y-4">
								{paginatedFlights.map((flight, i) => (
									<motion.div
										key={flight.id}
										initial={{ opacity: 0, y: 15 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: i * 0.05 }}>
										<FlightCard
											flight={flight}
											passengers={totalPassengers}
											departure={departure}
										/>
									</motion.div>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-8 flex items-center justify-center gap-2 pt-4 border-t border-border/60">
									<Button
										variant="outline"
										size="sm"
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
										className="h-10 w-10 rounded-full p-0 hover:bg-primary/10 hover:text-primary disabled:opacity-50">
										<ChevronLeft className="h-4 w-4" />
									</Button>

									<div className="flex items-center gap-1.5">
										{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											let pageNum: number;
											if (totalPages <= 5) {
												pageNum = i + 1;
											} else if (currentPage <= 3) {
												pageNum = i + 1;
											} else if (currentPage >= totalPages - 2) {
												pageNum = totalPages - 4 + i;
											} else {
												pageNum = currentPage - 2 + i;
											}

											return (
												<Button
													key={pageNum}
													variant={currentPage === pageNum ? 'default' : 'outline'}
													size="sm"
													onClick={() => goToPage(pageNum)}
													className={cn(
														'h-10 w-10 rounded-full p-0 transition-all',
														currentPage === pageNum ? 'shadow-lg shadow-primary/25' : 'hover:bg-primary/10 hover:text-primary'
													)}>
													{pageNum}
												</Button>
											);
										})}
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="h-10 w-10 rounded-full p-0 hover:bg-primary/10 hover:text-primary disabled:opacity-50">
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default function DashboardResultsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center py-20">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<p className="mt-4 text-sm text-muted-foreground">Loading results...</p>
				</div>
			}>
			<ResultsContent />
		</Suspense>
	);
}
