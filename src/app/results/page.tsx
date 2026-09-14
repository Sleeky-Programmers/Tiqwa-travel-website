'use client';

import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { FlightCard } from '@/components/features/FlightCard';
import { MultiCityFlightRow } from '@/components/features/MultiCityFlightRow';
import { InlineFlightSearchLoader } from '@/components/features/search/FlightSearchLoader';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Link, linkVariants } from '@/components/ui/Link';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    applyFlightFilters, getAvailableAirlines, getPriceRange, sortFlights, SortOption
} from '@/services/flightSearch';
import {
    CabinClass, extractAirportCode, FlightSearchParams, formatFlightPrice, getTotalPassengers,
    parseAirportValue, readCachedFlightSearch, searchFlightsForForm, searchMultiCityFlightsForForm
} from '@/services/whitelabel-api';

import type { Flight, StopsFilter } from '@/types/flight';
import type { MultiCityLeg, OutboundSegment } from '@/types/whitelabel';

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

function legsMatch(a?: MultiCityLeg[] | null, b?: MultiCityLeg[] | null): boolean {
	if (!a || !b || a.length !== b.length) return false;
	return a.every(
		(leg, i) =>
			extractAirportCode(leg.origin) === extractAirportCode(b[i].origin) &&
			extractAirportCode(leg.destination) === extractAirportCode(b[i].destination) &&
			leg.departure_date === b[i].departure_date
	);
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
	cabin: CabinClass,
	legs?: MultiCityLeg[] | null
): boolean {
	const normalizedTripType = tripType === 'roundtrip' ? 'roundtrip' : tripType === 'multicity' ? 'multicity' : 'oneway';

	if (cached.tripType !== normalizedTripType || cached.adults !== adults || cached.children !== children || cached.infants !== infants || cached.cabin !== cabin) {
		return false;
	}

	if (normalizedTripType === 'multicity') {
		return legsMatch(cached.legs, legs);
	}

	return (
		extractAirportCode(cached.from) === extractAirportCode(from) &&
		extractAirportCode(cached.to) === extractAirportCode(to) &&
		cached.departure === departure &&
		(cached.returnDate ?? '') === returnDate
	);
}

function formatMultiCityDate(value: string): string {
	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date);
}

const MULTI_CITY_FLIGHTS_PER_PAGE = 3;
const FLIGHTS_PER_PAGE = 100;

function formatAirportWithCode(value: string): string {
	const airport = parseAirportValue(value);
	return airport.code && airport.display !== airport.code ? `${airport.display} (${airport.code})` : airport.code || airport.display;
}

function formatSegmentAirport(segment: OutboundSegment, direction: 'from' | 'to'): string {
	const details = direction === 'from' ? segment.airport_from_details : segment.airport_to_details;
	const code = details?.iata_code ?? (direction === 'from' ? segment.airport_from : segment.airport_to);
	const city = details?.city;
	return city && code ? `${city} (${code})` : formatAirportWithCode(code);
}

function formatMultiCityRoute(routes: OutboundSegment[][]): string {
	const routeStops = routes.flatMap((segments, routeIndex) => {
		const firstSegment = segments[0];
		const lastSegment = segments[segments.length - 1];
		if (!firstSegment || !lastSegment) return [];
		return [formatSegmentAirport(firstSegment, 'from'), ...(routeIndex === routes.length - 1 ? [formatSegmentAirport(lastSegment, 'to')] : [])];
	});
	return routeStops.join(' → ');
}

function formatPassengerLabel(totalPassengers: number): string {
	return `${totalPassengers} Passenger${totalPassengers === 1 ? '' : 's'}`;
}

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
	const legsParam = searchParams.get('legs');
	const legs = useMemo<MultiCityLeg[] | null>(() => {
		if (!legsParam) return null;
		try {
			const parsed = JSON.parse(legsParam);
			return Array.isArray(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}, [legsParam]);

	const [baseFlights, setBaseFlights] = useState<Flight[]>([]);
	// Start "not loading" when a matching cached search already exists (the normal path when
	// arriving from the search form, which shows its own transition UI while the search runs).
	// Otherwise the results page would flash its own loader for one frame on top of the search
	// form's still-closing one — two transition overlays visible at once.
	const [isLoading, setIsLoading] = useState(() => {
		const cached = readCachedFlightSearch();
		return !(cached && paramsMatchCache(cached.params, from, to, departure, returnDate, tripType, adults, children, infants, cabin, legs));
	});
	const [error, setError] = useState<string | null>(null);

	const [sortBy, setSortBy] = useState<SortOption>('price');
	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
	const [stopsFilter, setStopsFilter] = useState<StopsFilter>('any');
	const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [multiCityPages, setMultiCityPages] = useState<Record<number, number>>({});

	const loadFlights = useCallback(async () => {
		setError(null);
		setCurrentPage(1);
		setMultiCityPages({});

		const cached = readCachedFlightSearch();
		if (cached && paramsMatchCache(cached.params, from, to, departure, returnDate, tripType, adults, children, infants, cabin, legs)) {
			setBaseFlights(cached.flights);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		if (tripType === 'multicity') {
			if (!legs || legs.length < 2) {
				setBaseFlights([]);
				setIsLoading(false);
				return;
			}

			const multiResult = await searchMultiCityFlightsForForm({ destinations: legs, adults, children, infants, cabin });

			if (multiResult.success && multiResult.flights) {
				setBaseFlights(multiResult.flights);
			} else {
				setError(multiResult.error ?? 'Flight search failed');
				setBaseFlights([]);
			}

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
	}, [from, to, departure, returnDate, adults, children, infants, cabin, tripType, legs]);

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
		if (tripType === 'multicity') return filteredFlights;
		const start = (currentPage - 1) * FLIGHTS_PER_PAGE;
		const end = start + FLIGHTS_PER_PAGE;
		return filteredFlights.slice(start, end);
	}, [filteredFlights, currentPage, tripType]);

	const multiCityGroups = useMemo(
		() =>
			tripType === 'multicity' && legs
				? legs.map((leg, legIndex) => ({
						leg,
						legIndex,
						flights: paginatedFlights.filter((flight) => flight.multiCityRoutes?.[legIndex]?.length),
				  }))
				: [],
		[legs, paginatedFlights, tripType]
	);

	const getMultiCityPageCount = (flightCount: number) => Math.ceil(flightCount / MULTI_CITY_FLIGHTS_PER_PAGE);
	const getMultiCityPage = (legIndex: number) => multiCityPages[legIndex] ?? 1;
	const setMultiCityPage = (legIndex: number, page: number) => {
		setMultiCityPages((pages) => ({ ...pages, [legIndex]: page }));
	};

	const routeDescription =
		tripType === 'multicity' && legs
			? formatMultiCityRoute(baseFlights.find((flight) => flight.multiCityRoutes?.length)?.multiCityRoutes ?? []) ||
			  legs
					.map((leg) => formatAirportWithCode(leg.origin))
					.concat(formatAirportWithCode(legs[legs.length - 1]?.destination ?? ''))
					.join(' → ')
			: from && to
			? `${formatAirportWithCode(from)} → ${formatAirportWithCode(to)}`
			: 'Search for flights';

	const toggleAirline = (airline: string) => {
		setSelectedAirlines((prev) => (prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]));
		setCurrentPage(1);
	};

	const clearFilters = () => {
		setMaxPrice(undefined);
		setStopsFilter('any');
		setSelectedAirlines([]);
		setCurrentPage(1);
		setMultiCityPages({});
	};

	const handleSortChange = (value: SortOption) => {
		setSortBy(value);
		setCurrentPage(1);
		setMultiCityPages({});
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const hasActiveFilters = maxPrice !== undefined || stopsFilter !== 'any' || selectedAirlines.length > 0;

	const filterPanel = (
		<div className="sticky top-24 space-y-7 rounded-md border border-border bg-background-card p-6 shadow-sm">
			<div className="flex items-center justify-between border-b border-border pb-5">
				<h3 className="text-lg font-bold">Filters</h3>
				{hasActiveFilters && (
					<button
						onClick={clearFilters}
						className={linkVariants({ variant: 'default', className: 'text-xs' })}>
						Clear all
					</button>
				)}
			</div>

			<div>
				<div className="flex items-baseline justify-between gap-4">
					<label className="text-xs font-bold uppercase tracking-wider text-foreground">Max price</label>
					<span className="text-lg font-bold text-primary">{formatFlightPrice(effectiveMaxPrice, displayCurrency)}</span>
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
					className="mt-2 w-full accent-primary"
				/>
				<div className="mt-2 flex justify-between text-xs text-muted-foreground">
					<span>{formatFlightPrice(priceRange.min, displayCurrency)}</span>
					<span>{formatFlightPrice(priceRange.max, displayCurrency)}</span>
				</div>
			</div>

			<div className="border-t border-border pt-5">
				<p className="text-sm font-medium">Stops</p>
				<div className="mt-2 flex flex-wrap gap-2">
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
							className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
								stopsFilter === opt.value ? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
							}`}>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			<div className="border-t border-border pt-5">
				<p className="text-sm font-medium">Airlines</p>
				<div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
					{airlines.map((airline) => (
						<label
							key={airline}
							className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedAirlines.includes(airline)}
								onChange={() => toggleAirline(airline)}
								className="accent-primary"
							/>
							{airline}
						</label>
					))}
				</div>
			</div>
		</div>
	);

	return (
		<PublicLayout footerVariant="results">
			<div className="page-fade-in bg-slate-50/70 py-28 dark:bg-background">
				<Container>
					<Link
						href="/search"
						variant="back"
						className="mb-6">
						Modify search
					</Link>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}>
						<div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Flight Results</h1>
								<p className="mt-1 text-muted-foreground">
									{routeDescription} • {formatPassengerLabel(totalPassengers)} • {CABIN_LABELS[cabin]}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									className="lg:hidden"
									onClick={() => setShowFilters(!showFilters)}>
									<SlidersHorizontal className="h-4 w-4" />
									Filters
								</Button>
								<SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground lg:block" />
								<Select
									value={sortBy}
									onValueChange={(value) => handleSortChange(value as SortOption)}>
									<SelectTrigger className="h-10 border-primary bg-transparent font-medium shadow-none outline-none hover:bg-transparent focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="price">Price: Low to High</SelectItem>
										<SelectItem value="duration">Duration</SelectItem>
										<SelectItem value="departure">Departure Time</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{error && (
							<div className="mb-6 flex flex-col gap-3 rounded-md bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-sm text-destructive">{error}</p>
								<Button
									variant="outline"
									size="sm"
									onClick={loadFlights}>
									Retry search
								</Button>
							</div>
						)}

						<div className="grid gap-8 lg:grid-cols-[320px_1fr]">
							<aside className="hidden lg:block">{filterPanel}</aside>

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
												className="absolute right-3 top-3 rounded-md p-1 hover:bg-muted">
												<X className="h-4 w-4" />
											</button>
											{filterPanel}
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<div id="results-section">
								{isLoading ? (
									<div className="glossy-card p-0">
										<InlineFlightSearchLoader
											from={from}
											to={to}
											departureDate={departure}
											returnDate={returnDate}
											passengers={totalPassengers}
											cabinLabel={CABIN_LABELS[cabin]}
										/>
									</div>
								) : paginatedFlights.length === 0 ? (
									<div className="glossy-card p-12 text-center">
										<p className="text-lg font-medium">No flights found</p>
										<p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters. Use airport codes like LOS or DXB.</p>
										<Link
											href="/search"
											className="mt-4 inline-block text-sm font-medium">
											Search again
										</Link>
									</div>
								) : (
									<>
										<div className="mb-3 flex items-center justify-between">
											<p className="text-sm text-muted-foreground">
												{filteredFlights.length} flight{filteredFlights.length > 1 ? 's' : ''} found
											</p>
										</div>

										<div className="space-y-5 pr-0">
											{tripType === 'multicity'
												? multiCityGroups.map(({ leg, flights, legIndex }) => {
														const groupPage = getMultiCityPage(legIndex);
														const groupPageCount = getMultiCityPageCount(flights.length);
														const visibleFlights = flights.slice((groupPage - 1) * MULTI_CITY_FLIGHTS_PER_PAGE, groupPage * MULTI_CITY_FLIGHTS_PER_PAGE);

														return (
															<section
																key={`${leg.origin}-${leg.destination}-${leg.departure_date}`}
																className="space-y-3">
																<div className="flex items-center justify-between gap-3 rounded-md bg-secondary/70 px-4 py-3">
																	<div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
																		<span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
																		<span className="truncate">
																			{leg.origin} → {leg.destination}
																		</span>
																		<span className="shrink-0 text-muted-foreground">·</span>
																		<span className="shrink-0 text-sm font-normal text-muted-foreground">{formatMultiCityDate(leg.departure_date)}</span>
																	</div>
																	<span className="shrink-0 rounded-full bg-background-card px-3 py-1 text-xs font-semibold text-primary">
																		{flights.length} result{flights.length === 1 ? '' : 's'}
																	</span>
																</div>
																<div className="space-y-3">
																	{visibleFlights.map((flight, flightIndex) => (
																		<motion.div
																			key={`${flight.id}-${legIndex}`}
																			initial={{ opacity: 0, y: 15 }}
																			animate={{ opacity: 1, y: 0 }}
																			transition={{ duration: 0.3, delay: flightIndex * 0.05 }}>
																			<MultiCityFlightRow
																				flight={flight}
																				segments={flight.multiCityRoutes?.[legIndex] ?? []}
																				departure={leg.departure_date}
																				passengers={totalPassengers}
																			/>
																		</motion.div>
																	))}
																</div>
																{groupPageCount > 1 && (
																	<div className="flex items-center justify-center gap-2 border-t border-border pt-3">
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => setMultiCityPage(legIndex, Math.max(1, groupPage - 1))}
																			disabled={groupPage === 1}
																			className="h-8 w-8 p-0">
																			<ChevronLeft className="h-4 w-4" />
																		</Button>
																		<span className="text-xs text-muted-foreground">
																			Page {groupPage} of {groupPageCount}
																		</span>
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => setMultiCityPage(legIndex, Math.min(groupPageCount, groupPage + 1))}
																			disabled={groupPage === groupPageCount}
																			className="h-8 w-8 p-0">
																			<ChevronRight className="h-4 w-4" />
																		</Button>
																	</div>
																)}
															</section>
														);
												  })
												: paginatedFlights.map((flight, i) => (
														<motion.div
															key={flight.id}
															initial={{ opacity: 0, y: 15 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ duration: 0.3, delay: i * 0.05 }}>
															<FlightCard
																isPublic
																flight={flight}
																departure={departure}
																passengers={totalPassengers}
																adults={adults}
																children={children}
																infants={infants}
															/>
														</motion.div>
												  ))}
										</div>

										{/* Multi-city pages contain three route groups; regular results use the existing flight pagination. */}
										{totalPages > 1 && (
											<div className="mt-6 flex items-center justify-center gap-2 pt-4 border-t border-border">
												<Button
													variant="outline"
													size="sm"
													onClick={() => goToPage(currentPage - 1)}
													disabled={currentPage === 1}
													className="h-9 w-9 p-0">
													<ChevronLeft className="h-4 w-4" />
												</Button>

												<div className="flex items-center gap-1">
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
																className="h-9 w-9 p-0">
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
													className="h-9 w-9 p-0">
													<ChevronRight className="h-4 w-4" />
												</Button>
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</motion.div>
				</Container>
			</div>
		</PublicLayout>
	);
}

export default function ResultsPage() {
	return (
		<Suspense
			fallback={
				<PublicLayout>
					<Container className="py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-muted-foreground">Loading results...</p>
					</Container>
				</PublicLayout>
			}>
			<ResultsContent />
		</Suspense>
	);
}
