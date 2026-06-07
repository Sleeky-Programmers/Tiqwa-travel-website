import { popularRoutes, type FlightRoute } from "@/data/mockData";
import { mockFlights, parseDuration } from "@/services/mockFlights";
import type { Flight } from "@/types/flight";

export type SortOption = "price" | "duration" | "departure";

export interface FlightFilters {
  maxPrice?: number;
  maxStops?: number | null;
  airlines?: string[];
}

const routeSchedules = [
  { departure: "06:30", arrival: "14:00", duration: "7h 30m", stops: 0, airline: "Tiqwa Air" },
  { departure: "10:15", arrival: "18:45", duration: "8h 30m", stops: 1, airline: "SkyBridge" },
  { departure: "14:00", arrival: "21:30", duration: "7h 30m", stops: 0, airline: "Global Wings" },
  { departure: "18:45", arrival: "04:15", duration: "9h 30m", stops: 1, airline: "Pacific Express" },
];

function matchesLocation(value: string, city: string, code: string): boolean {
  const v = value.toLowerCase().trim();
  if (!v) return true;
  return city.toLowerCase().includes(v) || code.toLowerCase().includes(v) || v.includes(city.toLowerCase());
}

function routeToFlights(route: FlightRoute): Flight[] {
  return routeSchedules.map((schedule, i) => ({
    id: `${route.id}-fl-${i}`,
    airline: schedule.airline,
    from: route.from,
    to: route.to,
    departure: schedule.departure,
    arrival: schedule.arrival,
    duration: schedule.duration,
    stops: schedule.stops,
    price: route.price + i * 40,
  }));
}

function matchesRoute(route: FlightRoute, from: string, to: string): boolean {
  const fromMatch = matchesLocation(from, route.from, route.fromCode);
  const toMatch = matchesLocation(to, route.to, route.toCode);
  return fromMatch && toMatch;
}

export function searchFlights(
  from: string,
  to: string,
  filters: FlightFilters = {}
): Flight[] {
  const fromMock = mockFlights.filter(
    (f) => matchesLocation(from, f.from, "") && matchesLocation(to, f.to, "")
  );

  const fromRoutes = popularRoutes
    .filter((r) => matchesRoute(r, from, to))
    .flatMap(routeToFlights);

  const merged = new Map<string, Flight>();
  [...fromMock, ...fromRoutes].forEach((flight) => {
    const key = `${flight.airline}-${flight.departure}-${flight.price}`;
    if (!merged.has(key)) merged.set(key, flight);
  });

  let results = Array.from(merged.values());

  if (!from && !to) {
    results = [...mockFlights];
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter((f) => f.price <= filters.maxPrice!);
  }

  if (filters.maxStops !== undefined && filters.maxStops !== null) {
    results = results.filter((f) => f.stops <= filters.maxStops!);
  }

  if (filters.airlines && filters.airlines.length > 0) {
    results = results.filter((f) => filters.airlines!.includes(f.airline));
  }

  return results;
}

export function sortFlights(flights: Flight[], sortBy: SortOption): Flight[] {
  return [...flights].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "duration") return parseDuration(a.duration) - parseDuration(b.duration);
    return a.departure.localeCompare(b.departure);
  });
}

export function getAvailableAirlines(flights: Flight[]): string[] {
  return [...new Set(flights.map((f) => f.airline))].sort();
}

export function getPriceRange(flights: Flight[]): { min: number; max: number } {
  if (flights.length === 0) return { min: 0, max: 1000 };
  const prices = flights.map((f) => f.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getFlightBySearchId(id: string): Flight | undefined {
  const fromMock = mockFlights.find((f) => f.id === id);
  if (fromMock) return fromMock;

  const routeId = id.replace(/-fl-\d+$/, "");
  const route = popularRoutes.find((r) => r.id === routeId);
  if (!route) return undefined;

  return routeToFlights(route).find((f) => f.id === id);
}
