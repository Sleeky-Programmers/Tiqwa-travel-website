export interface WhitelabelResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface HeroBanner {
  id: number;
  image: string;
}

export interface HolidayPackage {
  uniqueid: string;
  title: string;
  subtitle?: string;
  slug: string;
  link: string;
  location: string;
  description?: string;
  amount: number;
  currency: string;
  thumbnail: string;
}

export interface HomepageData {
  banners?: unknown[];
  hero_banners: HeroBanner[];
  holiday_packages: HolidayPackage[];
}

export interface FlightDeal {
  id?: number | string;
  origin?: string;
  destination?: string;
  origin_city?: string;
  destination_city?: string;
  amount?: number;
  currency?: string;
  airline_name?: string;
  airline_logo?: string;
  cabin?: string;
  departure_date?: string;
  return_date?: string | null;
  image?: string;
}

export interface PopularAirport {
  city: string;
  country: string;
  iata_code?: string;
  name?: string;
  image?: string;
  [key: string]: unknown;
}

export interface Airport {
  id?: number;
  iata_code: string;
  city: string;
  city_code?: string | null;
  country: string;
  name: string;
  popular?: number;
}

export interface AirportSegment {
  airline_details?: { code: string; name: string; logo?: string };
  airport_from?: string;
  airport_to?: string;
  airport_from_details?: { city: string; iata_code: string; name: string };
  airport_to_details?: { city: string; iata_code: string; name: string };
  departure_time: string;
  arrival_time: string;
  duration: number;
  flight_number?: string;
}

export interface WhitelabelFlightItem {
  id: string;
  amount: number;
  currency: string;
  outbound: AirportSegment[];
  inbound?: AirportSegment[];
  outbound_stops?: number;
  inbound_stops?: number;
  total_duration?: number;
  pricing?: { payable?: number };
}

export interface FlightSearchData {
  itemList: WhitelabelFlightItem[] | { message?: Record<string, string[]> };
  listing_id?: string;
}

export type PassengerType = "adult" | "child" | "infant";

export interface BookingPassengerPayload {
  passenger_type: PassengerType;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone_number: string;
}

export interface CreateBookingData {
  booking_id: string;
  reference: string;
}

export interface ConfirmPriceData {
  amount?: number;
  currency?: string;
  id?: string;
}

export interface PaymentInitiateData {
  payment_url: string;
}

export interface BookingDetails {
  reference: string;
  status?: string;
  amount?: number;
  currency?: string;
  passengers?: unknown[];
  [key: string]: unknown;
}
