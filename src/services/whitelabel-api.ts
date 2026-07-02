import type { Flight } from '@/types/flight';
import { getAccessToken } from '@/services/auth';
import { normalizeFlight } from '@/types/flight';

import type {
	BookingDetails,
	BookingPassengerPayload,
	ConfirmPriceData,
	CreateBookingData,
	FlightSearchData,
	FlightDeal,
	HomepageData,
	PaymentInitiateData,
	PopularAirport,
	Airport,
	WhitelabelFlightItem,
	WhitelabelResponse,
	VerifyPaymentData,
	FinalizeBookingData,
	PaymentGateway,
	PaymentMethod,
	BankAccount,
} from '@/types/whitelabel';

// Determine which API base to use
const isServer = typeof window === 'undefined';

// During build (server-side), use the real API URL directly
// During client-side, use the proxy to avoid CORS
export const API_BASE = isServer ? process.env.TIQWA_API_BASE_URL ?? 'https://sandbox.premiumwhitelabel.com/api/v2' : '/api/proxy';

// This is used by the proxy route
export const TIQWA_API_BASE_URL = process.env.TIQWA_API_BASE_URL ?? 'https://sandbox.premiumwhitelabel.com/api/v2';

export const FLIGHT_RESULTS_KEY = 'flightResults_v2';
export const SEARCH_PARAMS_KEY = 'searchParams_v2';
export const ACTIVE_BOOKING_KEY = 'activeBooking_v1';

export const BOOKING_RESERVATION_TTL_MS = 15 * 60 * 1000;

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface FlightSearchParams {
	from: string;
	to: string;
	departure: string;
	returnDate?: string;
	tripType: 'oneway' | 'roundtrip';
	adults: number;
	children: number;
	infants: number;
	cabin: CabinClass;
}

export function getTotalPassengers(params: Pick<FlightSearchParams, 'adults' | 'children' | 'infants'>): number {
	return params.adults + params.children + params.infants;
}

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

async function fetchAPI<T>(endpoint: string, options?: FetchOptions): Promise<T> {
	const result = await fetchAPIResult<T>(endpoint, options);
	if (!result.success) {
		throw new Error(result.error);
	}
	return result.data;
}

async function fetchAPIResult<T>(endpoint: string, options?: FetchOptions): Promise<{ success: true; data: T } | { success: false; error: string }> {
	const { next, ...fetchOptions } = options ?? {};

	if (!endpoint || endpoint === '') {
		return { success: false, error: 'Empty endpoint provided' };
	}

	try {
		// Get the auth token
		const token = getAccessToken();

		// Build headers
		const headers: Record<string, string> = {
			Accept: 'application/json',
			...(fetchOptions.headers as Record<string, string>),
		};

		// Add Authorization header if token exists
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE}${endpoint}`, {
			headers,
			...fetchOptions,
			...(typeof window === 'undefined' ? { next: next ?? { revalidate: 300 } } : {}),
		});

		const data = (await response.json()) as WhitelabelResponse<T>;

		if (!data.success) {
			return { success: false, error: data.message ?? 'API request failed' };
		}

		return { success: true, data: data.data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : 'API request failed',
		};
	}
}

function postJSON<T>(endpoint: string, body: unknown): Promise<{ success: true; data: T } | { success: false; error: string }> {
	const token = getAccessToken();

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return fetchAPIResult<T>(endpoint, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
		cache: 'no-store',
	});
}

export function extractAirportCode(input: string): string {
	const parenMatch = input.match(/\(([A-Za-z]{3})\)/);
	if (parenMatch) return parenMatch[1].toUpperCase();

	const trimmed = input.trim();
	if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

	return trimmed;
}

export function parseAirportValue(input?: string): {
	display: string;
	code: string;
} {
	if (!input?.trim()) return { display: '', code: '' };

	const trimmed = input.trim();
	const parenMatch = trimmed.match(/^(.+?)\s*\(([A-Za-z]{3})\)\s*$/);
	if (parenMatch) {
		return {
			display: parenMatch[1].trim(),
			code: parenMatch[2].toUpperCase(),
		};
	}

	if (/^[A-Za-z]{3}$/.test(trimmed)) {
		return { display: trimmed.toUpperCase(), code: trimmed.toUpperCase() };
	}

	return { display: trimmed, code: extractAirportCode(trimmed) };
}

export function formatAirportLabel(airport: Airport): string {
	return `${airport.city} (${airport.iata_code})`;
}

function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

function formatTime(iso: string): string {
	try {
		return new Date(iso).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});
	} catch {
		return iso;
	}
}

function resolveStopCount(value: unknown): number | undefined {
	if (value == null || value === '') return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function resolveOutboundStops(item: WhitelabelFlightItem): number {
	const fromApi = resolveStopCount(item.outbound_stops);
	if (fromApi !== undefined) return fromApi;
	return Math.max(0, (item.outbound?.length ?? 1) - 1);
}

export function transformFlightItem(item: WhitelabelFlightItem): Flight | null {
	const first = item.outbound?.[0];
	const last = item.outbound?.[item.outbound.length - 1];
	if (!first || !last) return null;

	const outboundStops = resolveOutboundStops(item);
	const inboundStops = resolveStopCount(item.inbound_stops);
	const segmentDuration = item.outbound.reduce((sum, seg) => sum + seg.duration, 0);
	const totalMinutes = item.total_duration ?? segmentDuration;

	return {
		id: item.id,
		airline: first.airline_details?.name ?? 'Unknown Airline',
		airlineCode: first.airline_details?.code,
		airlineLogo: first.airline_details?.logo ?? null,
		from: first.airport_from_details?.city ?? first.airport_from ?? '',
		fromCode: first.airport_from_details?.iata_code ?? first.airport_from,
		to: last.airport_to_details?.city ?? last.airport_to ?? '',
		toCode: last.airport_to_details?.iata_code ?? last.airport_to,
		departure: formatTime(first.departure_time),
		arrival: formatTime(last.arrival_time),
		duration: formatDuration(totalMinutes),
		stops: outboundStops,
		inboundStops,
		price: item.amount ?? item.pricing?.payable ?? 0,
		currency: item.currency ?? 'NGN',
		amount: item.amount,
		outbound_stops: outboundStops,
		inbound_stops: inboundStops,
		segmentCount: item.outbound?.length ?? 1,
		flightNumber: first.flight_number,
		fromCountryCode: first.airport_from_details?.country_code,
		toCountryCode: last.airport_to_details?.country_code,
		fromCountry: first.airport_from_details?.country,
		toCountry: last.airport_to_details?.country,
	};
}

export const mapWhitelabelFlight = transformFlightItem;

function isFlightList(itemList: FlightSearchData['itemList']): itemList is WhitelabelFlightItem[] {
	return Array.isArray(itemList);
}

export function mapFlightSearchResults(data: FlightSearchData): Flight[] {
	if (!isFlightList(data.itemList)) return [];
	return data.itemList
		.map(mapWhitelabelFlight)
		.filter((f): f is Flight => f !== null)
		.map(normalizeFlight);
}

export function getFlightSearchError(data: FlightSearchData): string | null {
	if (isFlightList(data.itemList)) return null;
	const messages = data.itemList.message;
	if (!messages) return 'No flights found';
	const parts = Object.entries(messages).flatMap(([, errs]) => errs);
	return parts[0] ?? 'Flight search failed';
}

export async function getHomepageData(): Promise<HomepageData> {
	return fetchAPI<HomepageData>('/');
}

export async function getFlightDeals(): Promise<FlightDeal[]> {
	return fetchAPI<FlightDeal[]>('/get/flight-deals');
}

export async function getPopularAirports(): Promise<PopularAirport[]> {
	return fetchAPI<PopularAirport[]>('/get/popular-airports');
}

export async function getAirports(keyword: string): Promise<Airport[]> {
	const trimmed = keyword.trim();
	if (trimmed.length < 2) return [];

	const query = new URLSearchParams({ keyword: trimmed });
	return fetchAPI<Airport[]>(`/get/airports?${query}`, {
		cache: 'no-store',
		next: { revalidate: 0 },
	});
}

export async function searchFlights(params: {
	origin: string;
	destination: string;
	departure_date: string;
	return_date?: string;
	adults: number;
	children?: number;
	infants?: number;
	cabin?: string;
}): Promise<FlightSearchData> {
	const query = new URLSearchParams({
		origin: extractAirportCode(params.origin),
		destination: extractAirportCode(params.destination),
		departure_date: params.departure_date,
		adults: String(params.adults),
		children: String(params.children ?? 0),
		infants: String(params.infants ?? 0),
		cabin: params.cabin ?? 'economy',
		return_date: params.return_date ?? '',
	});

	return fetchAPI<FlightSearchData>(`/flight/search?${query}`, {
		cache: 'no-store',
		next: { revalidate: 0 },
	});
}

export async function searchFlightsForForm(params: FlightSearchParams): Promise<{ success: boolean; flights?: any[]; error?: string }> {
	try {
		const data = await searchFlights({
			origin: params.from,
			destination: params.to,
			departure_date: params.departure,
			return_date: params.tripType === 'roundtrip' ? params.returnDate : '',
			adults: params.adults,
			children: params.children,
			infants: params.infants,
			cabin: params.cabin,
		});

		const validationError = getFlightSearchError(data);
		const flights = mapFlightSearchResults(data);

		if (flights.length === 0) {
			return {
				success: false,
				error: validationError ?? 'No flights found for this route',
			};
		}

		return { success: true, flights };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Flight search failed',
		};
	}
}

export function cacheFlightSearch(flights: Flight[], params: FlightSearchParams): void {
	sessionStorage.setItem(FLIGHT_RESULTS_KEY, JSON.stringify(flights.map(normalizeFlight)));
	sessionStorage.setItem(SEARCH_PARAMS_KEY, JSON.stringify(params));
}

export function readCachedFlightSearch(): {
	flights: Flight[];
	params: FlightSearchParams;
} | null {
	if (typeof window === 'undefined') return null;

	const cachedResults = sessionStorage.getItem(FLIGHT_RESULTS_KEY);
	const cachedParams = sessionStorage.getItem(SEARCH_PARAMS_KEY);

	if (!cachedResults || !cachedParams) return null;

	try {
		return {
			flights: (JSON.parse(cachedResults) as Flight[]).map(normalizeFlight),
			params: JSON.parse(cachedParams) as FlightSearchParams,
		};
	} catch {
		return null;
	}
}

export function getFlightFromCache(flightId: string): Flight | undefined {
	if (typeof window === 'undefined') return undefined;
	try {
		const flights = JSON.parse(sessionStorage.getItem(FLIGHT_RESULTS_KEY) ?? '[]') as Flight[];
		return flights.find((f) => f.id === flightId);
	} catch {
		return undefined;
	}
}

export function formatFlightPrice(price: number, currency = 'NGN'): string {
	if (currency === 'NGN') {
		return `₦${price.toLocaleString()}`;
	}
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(price);
}

export function getDefaultBrowseDate(): string {
	const date = new Date();
	date.setDate(date.getDate() + 30);
	return date.toISOString().split('T')[0];
}

export async function getAllFlights(params?: { origin?: string; destination?: string; departure_date?: string; adults?: number }): Promise<Flight[]> {
	const data = await searchFlights({
		origin: params?.origin ?? 'LOS',
		destination: params?.destination ?? 'ABV',
		departure_date: params?.departure_date ?? getDefaultBrowseDate(),
		adults: params?.adults ?? 1,
	});

	const validationError = getFlightSearchError(data);
	const flights = mapFlightSearchResults(data);

	if (flights.length === 0) {
		throw new Error(validationError ?? 'No flights available');
	}

	return flights;
}

export interface ActiveBooking {
	bookingId: string;
	reference: string;
	flightId: string;
	createdAt: number;
}

export function saveActiveBooking(booking: Omit<ActiveBooking, 'createdAt'>): void {
	if (typeof window === 'undefined') return;
	sessionStorage.setItem(ACTIVE_BOOKING_KEY, JSON.stringify({ ...booking, createdAt: Date.now() }));
}

export function readActiveBooking(): ActiveBooking | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = sessionStorage.getItem(ACTIVE_BOOKING_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as ActiveBooking;
	} catch {
		return null;
	}
}

export function clearActiveBooking(): void {
	if (typeof window === 'undefined') return;
	sessionStorage.removeItem(ACTIVE_BOOKING_KEY);
}

export function isBookingReservationExpired(createdAt: number, ttlMs = BOOKING_RESERVATION_TTL_MS): boolean {
	return Date.now() - createdAt > ttlMs;
}

export async function confirmFlightPrice(flightId: string) {
	return fetchAPIResult<ConfirmPriceData>(`/flight/confirm-price/${flightId}`, {
		cache: 'no-store',
	});
}

export async function createBooking(flightId: string, passengers: BookingPassengerPayload[]) {
	return postJSON<CreateBookingData>(`/flight/book/create/${flightId}`, {
		document_required: true,
		passengers,
	});
}

export async function reserveBooking(bookingId: string, flightId: string) {
	return postJSON<unknown>('/flight/book/reserve', {
		booking_id: bookingId,
		flight_id: flightId,
	});
}

// export async function initiatePayment(
// 	bookingId: string,
// 	flightId: string,
// 	options?: {
// 		currency?: string;
// 		paymentMethod?: string;
// 		paymentGateway?: string;
// 	}
// ) {
// 	return postJSON<PaymentInitiateData>('/payment/flight/initiate', {
// 		flight_id: flightId,
// 		booking_id: bookingId,
// 		payment_method: options?.paymentMethod ?? 'ONLINE_TRANSFER',
// 		payment_gateway: options?.paymentGateway ?? 'paystack',
// 		currency: options?.currency ?? 'NGN',
// 	});
// }

export async function initiatePayment(
	bookingId: string,
	flightId: string,
	options?: {
		currency?: string;
		paymentMethod?: string;
		paymentGateway?: string;
		instalment?: number;
	}
) {
	const payload: {
		flight_id: string;
		booking_id: string;
		payment_method: string;
		currency: string;
		payment_gateway?: string;
		instalment?: number;
	} = {
		flight_id: flightId,
		booking_id: bookingId,
		payment_method: options?.paymentMethod ?? 'ONLINE_TRANSFER',
		currency: options?.currency ?? 'NGN',
	};

	if (options?.paymentGateway && options.paymentMethod !== 'WALK_IN_TRANSFER') {
		payload.payment_gateway = options.paymentGateway;
	}

	if (options?.instalment) {
		payload.instalment = options.instalment;
	}

	return postJSON<PaymentInitiateData>('/payment/flight/initiate', payload);
}

export async function verifyPayment(reference: string, trxref: string) {
	return fetchAPIResult<VerifyPaymentData>(`/payment/callback?reference=${reference}&trxref=${trxref}`, {
		cache: 'no-store',
	});
}

export async function finalizeBooking(bookingId: string, flightId: string) {
	return postJSON<FinalizeBookingData>('/flight/book', {
		booking_id: bookingId,
		flight_id: flightId,
	});
}

export async function getBookingDetails(reference: string) {
	return fetchAPIResult<BookingDetails>(`/flight/booking-details/${reference}`, {
		cache: 'no-store',
	});
}

export async function initiateBookingFlow(
	flightId: string,
	passengers: BookingPassengerPayload[],
	currency = 'NGN'
): Promise<
	| {
			success: true;
			paymentUrl: string;
			bookingId: string;
			reference: string;
			tranxReference: string;
	  }
	| { success: false; error: string }
> {
	// 1. Create booking
	const createResult = await createBooking(flightId, passengers);
	if (!createResult.success) {
		return createResult;
	}

	const { booking_id, reference } = createResult.data;
	saveActiveBooking({ bookingId: booking_id, reference, flightId });

	// 2. Initiate payment
	const paymentResult = await initiatePayment(booking_id, flightId, { currency });

	if (!paymentResult.success) {
		console.log({ paymentResult, success: false });
		return paymentResult;
	}

	console.log({ authorization_url: paymentResult.data.authorization_url });
	return {
		reference,
		success: true,
		bookingId: booking_id,
		tranxReference: paymentResult.data.tranx_reference,
		paymentUrl: paymentResult.data.authorization_url,
	};
}

export function cacheSelectedFlight(flight: Flight): void {
	if (typeof window === 'undefined') return;

	const normalized = normalizeFlight(flight);

	try {
		const existing = (JSON.parse(sessionStorage.getItem(FLIGHT_RESULTS_KEY) ?? '[]') as Flight[]).map(normalizeFlight);
		const updated = existing.some((f) => f.id === normalized.id) ? existing : [...existing, normalized];
		sessionStorage.setItem(FLIGHT_RESULTS_KEY, JSON.stringify(updated));
	} catch {
		sessionStorage.setItem(FLIGHT_RESULTS_KEY, JSON.stringify([normalized]));
	}
}

export interface FlightBooking {
	// Core identifiers
	id: string;
	reference: string;
	booking_id: string;
	flight_id: string;
	user_id: number;

	// Flight details
	from: string;
	fromCode: string;
	to: string;
	toCode: string;
	departureDate: string;
	arrivalDate: string;
	returnDate?: string;

	// Pricing
	amount: number;
	currency: string;
	payable_amount: number;

	// Status
	status: 'BOOKED' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'RESERVED';
	ticket_issued: boolean;

	// Passenger info
	passengers: Array<{
		first_name: string;
		last_name: string;
		email: string;
		phone_number: string;
		dob: string;
		gender: string;
		passenger_type: string;
	}>;

	// Flight segments
	outbound: Array<{
		flight_number: string;
		airport_from: string;
		airport_to: string;
		departure_time: string;
		arrival_time: string;
		duration: number;
		cabin_type: string;
		airline: string;
		airline_code: string;
		airline_logo?: string;
	}>;
	inbound?: Array<{
		flight_number: string;
		airport_from: string;
		airport_to: string;
		departure_time: string;
		arrival_time: string;
		duration: number;
		cabin_type: string;
		airline: string;
		airline_code: string;
		airline_logo?: string;
	}>;

	// Metadata
	created_at: string;
	expires_at: string;
	total_duration: number;
	stops: number;
	booking_date: string;
}

export interface RewardsData {
	total_referral_reward: number;
	referral_code: string;
	referral_history: Array<{ referred_user: string; date: string }>;
	referral_payment_history: Array<{ amount: number; date: string }>;
	allow_withdraw: boolean;
}

function mapFlightBooking(raw: Record<string, unknown>): FlightBooking {
	const outboundSegments = Array.isArray(raw.outbound) ? raw.outbound : [];
	const inboundSegments = Array.isArray(raw.inbound) ? raw.inbound : [];
	const passengers = Array.isArray(raw.passengers) ? raw.passengers : [];

	const firstSegment = outboundSegments[0] as Record<string, unknown> | undefined;
	const lastSegment = outboundSegments[outboundSegments.length - 1] as Record<string, unknown> | undefined;

	// Type-safe helpers
	const getString = (obj: Record<string, unknown> | undefined, key: string): string => {
		return obj && typeof obj[key] === 'string' ? (obj[key] as string) : '';
	};

	const getNumber = (obj: Record<string, unknown> | undefined, key: string): number => {
		return obj && typeof obj[key] === 'number' ? (obj[key] as number) : 0;
	};

	const getAirportCity = (segment: Record<string, unknown> | undefined): string => {
		if (!segment) return '';
		const details = segment.airport_from_details as Record<string, unknown> | undefined;
		return (details?.city as string) || '';
	};

	const getAirportToCity = (segment: Record<string, unknown> | undefined): string => {
		if (!segment) return '';
		const details = segment.airport_to_details as Record<string, unknown> | undefined;
		return (details?.city as string) || '';
	};

	const getAirlineName = (segment: Record<string, unknown> | undefined): string => {
		if (!segment) return '';
		const details = segment.airline_details as Record<string, unknown> | undefined;
		return (details?.name as string) || '';
	};

	const getAirlineCode = (segment: Record<string, unknown> | undefined): string => {
		if (!segment) return '';
		const details = segment.airline_details as Record<string, unknown> | undefined;
		return (details?.code as string) || '';
	};

	const getAirlineLogo = (segment: Record<string, unknown> | undefined): string => {
		if (!segment) return '';
		const details = segment.airline_details as Record<string, unknown> | undefined;
		return (details?.logo as string) || '';
	};

	const statusRaw = String(raw.status ?? 'pending').toUpperCase();
	const statusMap: Record<string, FlightBooking['status']> = {
		BOOKED: 'BOOKED',
		CONFIRMED: 'CONFIRMED',
		PENDING: 'PENDING',
		CANCELLED: 'CANCELLED',
		RESERVED: 'RESERVED',
	};
	const status = statusMap[statusRaw] || 'PENDING';

	return {
		id: String(raw.id ?? raw.booking_id ?? raw.reference ?? ''),
		reference: String(raw.reference ?? raw.booking_reference ?? ''),
		booking_id: String(raw.booking_id ?? ''),
		flight_id: String(raw.flight_id ?? ''),
		user_id: Number(raw.user_id ?? 0),

		from: getAirportCity(firstSegment),
		fromCode: getString(firstSegment, 'airport_from'),
		to: getAirportToCity(lastSegment),
		toCode: getString(lastSegment, 'airport_to'),
		departureDate: getString(firstSegment, 'departure_time') || String(raw.departureDate ?? raw.departure_date ?? raw.departure ?? ''),
		arrivalDate: getString(lastSegment, 'arrival_time') || String(raw.arrivalDate ?? raw.arrival_date ?? raw.arrival ?? ''),
		returnDate: raw.return_date ? String(raw.return_date) : undefined,

		amount: Number(raw.amount ?? raw.total ?? 0),
		currency: String(raw.currency ?? 'NGN'),
		payable_amount: Number(raw.payable_amount ?? raw.amount ?? 0),

		status,
		ticket_issued: Boolean(raw.ticket_issued),

		passengers: passengers.map((p: Record<string, unknown>) => ({
			first_name: String(p.first_name ?? ''),
			last_name: String(p.last_name ?? ''),
			email: String(p.email ?? ''),
			phone_number: String(p.phone_number ?? ''),
			dob: String(p.dob ?? ''),
			gender: String(p.gender ?? ''),
			passenger_type: String(p.passenger_type ?? 'adult'),
		})),

		outbound: outboundSegments.map((seg: Record<string, unknown>) => ({
			flight_number: String(seg.flight_number ?? ''),
			airport_from: String(seg.airport_from ?? ''),
			airport_to: String(seg.airport_to ?? ''),
			departure_time: String(seg.departure_time ?? ''),
			arrival_time: String(seg.arrival_time ?? ''),
			duration: Number(seg.duration ?? 0),
			cabin_type: String(seg.cabin_type ?? 'economy'),
			airline: getAirlineName(seg),
			airline_code: getAirlineCode(seg),
			airline_logo: getAirlineLogo(seg),
		})),

		inbound:
			inboundSegments.length > 0
				? inboundSegments.map((seg: Record<string, unknown>) => ({
						flight_number: String(seg.flight_number ?? ''),
						airport_from: String(seg.airport_from ?? ''),
						airport_to: String(seg.airport_to ?? ''),
						departure_time: String(seg.departure_time ?? ''),
						arrival_time: String(seg.arrival_time ?? ''),
						duration: Number(seg.duration ?? 0),
						cabin_type: String(seg.cabin_type ?? 'economy'),
						airline: getAirlineName(seg),
						airline_code: getAirlineCode(seg),
						airline_logo: getAirlineLogo(seg),
				  }))
				: undefined,

		created_at: String(raw.created_at ?? ''),
		expires_at: String(raw.expires_at ?? ''),
		total_duration: Number(raw.total_duration ?? 0),
		stops: Number(raw.outbound_stops ?? 0),
		booking_date: String(raw.created_at ?? ''),
	};
}

function mapRewardsData(raw: Record<string, unknown>): RewardsData {
	return {
		total_referral_reward: Number(raw.total_referral_reward ?? 0),
		referral_code: String(raw.referral_code ?? ''),
		referral_history: Array.isArray(raw.referral_history) ? (raw.referral_history as RewardsData['referral_history']) : [],
		referral_payment_history: Array.isArray(raw.referral_payment_history) ? (raw.referral_payment_history as RewardsData['referral_payment_history']) : [],
		allow_withdraw: Boolean(raw.allow_withdraw),
	};
}

export async function getFlightBookings(): Promise<{
	success: boolean;
	data: FlightBooking[];
}> {
	const token = getAccessToken();
	if (!token) return { success: false, data: [] };

	try {
		const response = await fetch(`${API_BASE}/user/flight-bookings`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const result = await response.json();
		const bookings = Array.isArray(result.data?.bookings) ? result.data.bookings : Array.isArray(result.data) ? result.data : [];

		return {
			success: Boolean(result.success),
			data: bookings.map((b: Record<string, unknown>) => mapFlightBooking(b)),
		};
	} catch {
		return { success: false, data: [] };
	}
}

export async function getRewardsData(): Promise<{
	success: boolean;
	data: RewardsData | null;
}> {
	const token = getAccessToken();
	if (!token) return { success: false, data: null };

	try {
		const response = await fetch(`${API_BASE}/user/rewards`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const result = await response.json();

		if (result.success && result.data?.rewards) {
			return {
				success: true,
				data: mapRewardsData(result.data.rewards as Record<string, unknown>),
			};
		}

		if (result.success && result.data) {
			return {
				success: true,
				data: mapRewardsData(result.data as Record<string, unknown>),
			};
		}

		return { success: false, data: null };
	} catch {
		return { success: false, data: null };
	}
}

export async function getPaymentMethods() {
	return fetchAPIResult<PaymentMethod[]>('/get/payment-methods');
}

export async function getPaymentGateways() {
	return fetchAPIResult<PaymentGateway[]>('/get/payment-gateways');
}

export async function getBankAccounts() {
	return fetchAPIResult<BankAccount[]>('/get/bank-accounts');
}
