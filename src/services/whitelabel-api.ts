import type { Flight } from "@/types/flight";
import { normalizeFlight } from "@/types/flight";
import type {
  FlightSearchData,
  FlightDeal,
  HomepageData,
  PopularAirport,
  WhitelabelFlightItem,
  WhitelabelResponse,
} from "@/types/whitelabel";

export const API_BASE =
  process.env.NEXT_PUBLIC_TIQWA_API_URL ??
  process.env.TIQWA_API_URL ??
  "https://sandbox.premiumwhitelabel.com/api/v2";

export const FLIGHT_RESULTS_KEY = "flightResults_v2";
export const SEARCH_PARAMS_KEY = "searchParams_v2";

export interface FlightSearchParams {
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  passengers: number;
  tripType: "oneway" | "roundtrip";
}

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

async function fetchAPI<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const { next, ...fetchOptions } = options ?? {};
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Accept: "application/json", ...fetchOptions.headers },
    ...fetchOptions,
    ...(typeof window === "undefined" ? { next: next ?? { revalidate: 300 } } : {}),
  });

  const data = (await response.json()) as WhitelabelResponse<T>;

  if (!data.success) {
    throw new Error(data.message ?? "API request failed");
  }

  return data.data;
}

export function extractAirportCode(input: string): string {
  const parenMatch = input.match(/\(([A-Za-z]{3})\)/);
  if (parenMatch) return parenMatch[1].toUpperCase();

  const trimmed = input.trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

  return trimmed;
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

  const v = await fetchAPI<FlightSearchData>(`/flight/search?${query}`, {
    cache: "no-store",
    next: { revalidate: 0 },
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
      adults: params.passengers,
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
