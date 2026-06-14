import type { Flight } from "@/types/flight";
import { normalizeFlight } from "@/types/flight";
import { getAccessToken } from "@/services/auth";
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
} from "@/types/whitelabel";

export const API_BASE =
  process.env.NEXT_PUBLIC_TIQWA_API_URL ??
  process.env.TIQWA_API_URL ??
  "https://sandbox.premiumwhitelabel.com/api/v2";

export const FLIGHT_RESULTS_KEY = "flightResults_v2";
export const SEARCH_PARAMS_KEY = "searchParams_v2";
export const ACTIVE_BOOKING_KEY = "activeBooking_v1";

export const BOOKING_RESERVATION_TTL_MS = 15 * 60 * 1000;

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface FlightSearchParams {
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  tripType: "oneway" | "roundtrip";
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
}

export function getTotalPassengers(
  params: Pick<FlightSearchParams, "adults" | "children" | "infants">
): number {
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

async function fetchAPIResult<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const { next, ...fetchOptions } = options ?? {};

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Accept: "application/json", ...fetchOptions.headers },
      ...fetchOptions,
      ...(typeof window === "undefined" ? { next: next ?? { revalidate: 300 } } : {}),
    });

    const data = (await response.json()) as WhitelabelResponse<T>;

    if (!data.success) {
      return { success: false, error: data.message ?? "API request failed" };
    }

    return { success: true, data: data.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "API request failed",
    };
  }
}

function postJSON<T>(endpoint: string, body: unknown): Promise<{ success: true; data: T } | { success: false; error: string }> {
  return fetchAPIResult<T>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
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
  if (!input?.trim()) return { display: "", code: "" };

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
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function resolveStopCount(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
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
    airline: first.airline_details?.name ?? "Unknown Airline",
    airlineCode: first.airline_details?.code,
    from: first.airport_from_details?.city ?? first.airport_from ?? "",
    fromCode: first.airport_from_details?.iata_code ?? first.airport_from,
    to: last.airport_to_details?.city ?? last.airport_to ?? "",
    toCode: last.airport_to_details?.iata_code ?? last.airport_to,
    departure: formatTime(first.departure_time),
    arrival: formatTime(last.arrival_time),
    duration: formatDuration(totalMinutes),
    stops: outboundStops,
    inboundStops,
    price: item.amount ?? item.pricing?.payable ?? 0,
    currency: item.currency ?? "NGN",
    amount: item.amount,
    outbound_stops: outboundStops,
    inbound_stops: inboundStops,
    segmentCount: item.outbound?.length ?? 1,
    flightNumber: first.flight_number,
  };
}

export const mapWhitelabelFlight = transformFlightItem;

function isFlightList(
  itemList: FlightSearchData["itemList"]
): itemList is WhitelabelFlightItem[] {
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
  if (!messages) return "No flights found";
  const parts = Object.entries(messages).flatMap(([, errs]) => errs);
  return parts[0] ?? "Flight search failed";
}

export async function getHomepageData(): Promise<HomepageData> {
  return fetchAPI<HomepageData>("/");
}

export async function getFlightDeals(): Promise<FlightDeal[]> {
  return fetchAPI<FlightDeal[]>("/get/flight-deals");
}

export async function getPopularAirports(): Promise<PopularAirport[]> {
  return fetchAPI<PopularAirport[]>("/get/popular-airports");
}

export async function getAirports(keyword: string): Promise<Airport[]> {
  const trimmed = keyword.trim();
  if (trimmed.length < 2) return [];

  const query = new URLSearchParams({ keyword: trimmed });
  return fetchAPI<Airport[]>(`/get/airports?${query}`, {
    cache: "no-store",
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
    cabin: params.cabin ?? "economy",
    return_date: params.return_date ?? "",
  });

  return fetchAPI<FlightSearchData>(`/flight/search?${query}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
}

export async function searchFlightsForForm(
  params: FlightSearchParams
): Promise<{ success: boolean; flights?: Flight[]; error?: string }> {
  try {
    const data = await searchFlights({
      origin: params.from,
      destination: params.to,
      departure_date: params.departure,
      return_date:
        params.tripType === "roundtrip" ? params.returnDate : "",
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
        error: validationError ?? "No flights found for this route",
      };
    }

    return { success: true, flights };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Flight search failed",
    };
  }
}

export function cacheFlightSearch(
  flights: Flight[],
  params: FlightSearchParams
): void {
  sessionStorage.setItem(
    FLIGHT_RESULTS_KEY,
    JSON.stringify(flights.map(normalizeFlight))
  );
  sessionStorage.setItem(SEARCH_PARAMS_KEY, JSON.stringify(params));
}

export function readCachedFlightSearch(): {
  flights: Flight[];
  params: FlightSearchParams;
} | null {
  if (typeof window === "undefined") return null;

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
  if (typeof window === "undefined") return undefined;
  try {
    const flights = JSON.parse(
      sessionStorage.getItem(FLIGHT_RESULTS_KEY) ?? "[]"
    ) as Flight[];
    return flights.find((f) => f.id === flightId);
  } catch {
    return undefined;
  }
}

export function formatFlightPrice(price: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return `₦${price.toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getDefaultBrowseDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

export async function getAllFlights(params?: {
  origin?: string;
  destination?: string;
  departure_date?: string;
  adults?: number;
}): Promise<Flight[]> {
  const data = await searchFlights({
    origin: params?.origin ?? "LOS",
    destination: params?.destination ?? "ABV",
    departure_date: params?.departure_date ?? getDefaultBrowseDate(),
    adults: params?.adults ?? 1,
  });

  const validationError = getFlightSearchError(data);
  const flights = mapFlightSearchResults(data);

  if (flights.length === 0) {
    throw new Error(validationError ?? "No flights available");
  }

  return flights;
}

export interface ActiveBooking {
  bookingId: string;
  reference: string;
  flightId: string;
  createdAt: number;
}

export function saveActiveBooking(booking: Omit<ActiveBooking, "createdAt">): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    ACTIVE_BOOKING_KEY,
    JSON.stringify({ ...booking, createdAt: Date.now() })
  );
}

export function readActiveBooking(): ActiveBooking | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_BOOKING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveBooking;
  } catch {
    return null;
  }
}

export function clearActiveBooking(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACTIVE_BOOKING_KEY);
}

export function isBookingReservationExpired(
  createdAt: number,
  ttlMs = BOOKING_RESERVATION_TTL_MS
): boolean {
  return Date.now() - createdAt > ttlMs;
}

export async function confirmFlightPrice(flightId: string) {
  return fetchAPIResult<ConfirmPriceData>(`/flight/confirm-price/${flightId}`, {
    cache: "no-store",
  });
}

export async function createBooking(
  flightId: string,
  passengers: BookingPassengerPayload[]
) {
  return postJSON<CreateBookingData>(`/flight/book/create/${flightId}`, {
    passengers,
  });
}

export async function reserveBooking(bookingId: string, flightId: string) {
  return postJSON<unknown>("/flight/book/reserve", {
    booking_id: bookingId,
    flight_id: flightId,
  });
}

export async function initiatePayment(
  bookingId: string,
  flightId: string,
  options?: { currency?: string }
) {
  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/payment/callback`
      : undefined;

  return postJSON<PaymentInitiateData>("/payment/flight/initiate", {
    flight_id: flightId,
    booking_id: bookingId,
    payment_method: "ONLINE_TRANSFER",
    payment_gateway: "paystack",
    currency: options?.currency ?? "NGN",
    ...(callbackUrl ? { callback_url: callbackUrl } : {}),
  });
}

export async function getBookingDetails(reference: string) {
  return fetchAPIResult<BookingDetails>(`/flight/booking-details/${reference}`, {
    cache: "no-store",
  });
}

export async function completeBookingFlow(
  flightId: string,
  passenger: BookingPassengerPayload,
  currency = "NGN"
): Promise<
  | {
      success: true;
      paymentUrl: string;
      bookingId: string;
      reference: string;
    }
  | { success: false; error: string }
> {
  const createResult = await createBooking(flightId, [passenger]);
  if (!createResult.success) {
    return createResult;
  }

  const { booking_id, reference } = createResult.data;
  saveActiveBooking({ bookingId: booking_id, reference, flightId });

  const reserveResult = await reserveBooking(booking_id, flightId);
  if (!reserveResult.success) {
    return reserveResult;
  }

  const paymentResult = await initiatePayment(booking_id, flightId, { currency });
  if (!paymentResult.success) {
    return paymentResult;
  }

  if (!paymentResult.data.payment_url) {
    return { success: false, error: "Payment URL not returned by gateway" };
  }

  return {
    success: true,
    paymentUrl: paymentResult.data.payment_url,
    bookingId: booking_id,
    reference,
  };
}

export function cacheSelectedFlight(flight: Flight): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeFlight(flight);

  try {
    const existing = (JSON.parse(
      sessionStorage.getItem(FLIGHT_RESULTS_KEY) ?? "[]"
    ) as Flight[]).map(normalizeFlight);
    const updated = existing.some((f) => f.id === normalized.id)
      ? existing
      : [...existing, normalized];
    sessionStorage.setItem(FLIGHT_RESULTS_KEY, JSON.stringify(updated));
  } catch {
    sessionStorage.setItem(
      FLIGHT_RESULTS_KEY,
      JSON.stringify([normalized])
    );
  }
}

export interface FlightBooking {
  id: string;
  reference: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  amount: number;
  currency: string;
  status: "confirmed" | "pending" | "cancelled";
  cabin: string;
}

export interface RewardsData {
  total_referral_reward: number;
  referral_code: string;
  referral_history: Array<{ referred_user: string; date: string }>;
  referral_payment_history: Array<{ amount: number; date: string }>;
  allow_withdraw: boolean;
}

function mapFlightBooking(raw: Record<string, unknown>): FlightBooking {
  const statusRaw = String(raw.status ?? "pending").toLowerCase();
  const status: FlightBooking["status"] =
    statusRaw === "confirmed" || statusRaw === "cancelled"
      ? statusRaw
      : "pending";

  return {
    id: String(raw.id ?? raw.booking_id ?? raw.reference ?? ""),
    reference: String(raw.reference ?? raw.booking_reference ?? ""),
    from: String(
      raw.from ?? raw.origin ?? raw.departure_city ?? raw.airport_from ?? ""
    ),
    to: String(
      raw.to ?? raw.destination ?? raw.arrival_city ?? raw.airport_to ?? ""
    ),
    departureDate: String(
      raw.departureDate ?? raw.departure_date ?? raw.departure ?? ""
    ),
    returnDate: raw.return_date ? String(raw.return_date) : undefined,
    amount: Number(raw.amount ?? raw.total ?? raw.payable ?? 0),
    currency: String(raw.currency ?? "NGN"),
    status,
    cabin: String(raw.cabin ?? raw.cabin_class ?? "economy"),
  };
}

function mapRewardsData(raw: Record<string, unknown>): RewardsData {
  return {
    total_referral_reward: Number(raw.total_referral_reward ?? 0),
    referral_code: String(raw.referral_code ?? ""),
    referral_history: Array.isArray(raw.referral_history)
      ? (raw.referral_history as RewardsData["referral_history"])
      : [],
    referral_payment_history: Array.isArray(raw.referral_payment_history)
      ? (raw.referral_payment_history as RewardsData["referral_payment_history"])
      : [],
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
    const bookings = Array.isArray(result.data?.bookings)
      ? result.data.bookings
      : Array.isArray(result.data)
        ? result.data
        : [];

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
