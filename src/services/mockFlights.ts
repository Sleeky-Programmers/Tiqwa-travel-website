import type { Flight } from "@/types/flight";

export const mockFlights: Flight[] = [
  { id: "fl-001", airline: "Tiqwa Air", from: "New York", to: "London", departure: "08:00", arrival: "20:30", duration: "7h 30m", stops: 0, outbound_stops: 0, price: 549, currency: "USD" },
  { id: "fl-002", airline: "SkyBridge", from: "New York", to: "London", departure: "14:15", arrival: "02:45", duration: "8h 30m", stops: 1, outbound_stops: 1, price: 429, currency: "USD" },
  { id: "fl-003", airline: "Global Wings", from: "New York", to: "Paris", departure: "09:30", arrival: "22:00", duration: "8h 30m", stops: 0, outbound_stops: 0, price: 589, currency: "USD" },
  { id: "fl-004", airline: "Tiqwa Air", from: "Los Angeles", to: "Tokyo", departure: "11:00", arrival: "15:30", duration: "11h 30m", stops: 0, outbound_stops: 0, price: 899, currency: "USD" },
  { id: "fl-005", airline: "Pacific Express", from: "Los Angeles", to: "Tokyo", departure: "22:45", arrival: "05:15", duration: "12h 30m", stops: 1, outbound_stops: 1, price: 749, currency: "USD" },
  { id: "fl-006", airline: "Desert Star", from: "Dubai", to: "Singapore", departure: "06:20", arrival: "18:50", duration: "7h 30m", stops: 0, outbound_stops: 0, price: 399, currency: "USD" },
  { id: "fl-007", airline: "Tiqwa Air", from: "London", to: "Dubai", departure: "10:00", arrival: "20:15", duration: "6h 15m", stops: 0, outbound_stops: 0, price: 479, currency: "USD" },
  { id: "fl-008", airline: "EuroConnect", from: "Paris", to: "Rome", departure: "07:45", arrival: "09:55", duration: "2h 10m", stops: 0, outbound_stops: 0, price: 189, currency: "USD" },
  { id: "fl-009", airline: "Atlantic Flyer", from: "Chicago", to: "Miami", departure: "16:30", arrival: "20:45", duration: "3h 15m", stops: 0, outbound_stops: 0, price: 219, currency: "USD" },
  { id: "fl-010", airline: "Tiqwa Air", from: "San Francisco", to: "Sydney", departure: "23:00", arrival: "08:30", duration: "14h 30m", stops: 1, outbound_stops: 1, price: 1129, currency: "USD" },
];

export function filterFlights(from: string, to: string): Flight[] {
  const fromLower = from.toLowerCase().trim();
  const toLower = to.toLowerCase().trim();
  if (!fromLower && !toLower) return mockFlights;
  return mockFlights.filter((flight) => {
    const matchesFrom = !fromLower || flight.from.toLowerCase().includes(fromLower);
    const matchesTo = !toLower || flight.to.toLowerCase().includes(toLower);
    return matchesFrom && matchesTo;
  });
}

export function getFlightById(id: string): Flight | undefined {
  return mockFlights.find((flight) => flight.id === id);
}

export function parseDuration(duration: string | number): number {
  if (typeof duration === "number") return duration;
  const hours = duration.match(/(\d+)h/)?.[1];
  const minutes = duration.match(/(\d+)m/)?.[1];
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}
