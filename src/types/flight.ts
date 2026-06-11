export interface Flight {
  id: string;
  airline: string;
  airlineCode?: string;
  from: string;
  fromCode?: string;
  to: string;
  toCode?: string;
  departure: string;
  arrival: string;
  duration: number | string;
  stops: number;
  inboundStops?: number;
  price: number;
  currency: string;
  amount?: number;
  outbound_stops?: number;
  inbound_stops?: number;
  segmentCount?: number;
  flightNumber?: string;
}

export type StopsFilter = "any" | "nonstop" | "one-stop-max";

function parseStopCount(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export interface SearchParams {
  from: string;
  to: string;
  departure: string;
  passengers: number;
}

export function getFlightStops(flight: Flight): number {
  const fromOutbound = parseStopCount(flight.outbound_stops);
  if (fromOutbound !== undefined) return fromOutbound;

  const fromStops = parseStopCount(flight.stops);
  if (fromStops !== undefined) return fromStops;

  if (flight.segmentCount != null && flight.segmentCount > 1) {
    return flight.segmentCount - 1;
  }

  return 0;
}

export function matchesStopsFilter(
  flight: Flight,
  filter: StopsFilter
): boolean {
  const stops = getFlightStops(flight);
  if (filter === "nonstop") return stops === 0;
  if (filter === "one-stop-max") return stops <= 1;
  return true;
}

export function normalizeFlight(flight: Flight): Flight {
  const stops = getFlightStops(flight);
  return {
    ...flight,
    stops,
    outbound_stops: stops,
  };
}
