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
	airport_from_details?: { city: string; iata_code: string; name: string; country_code: string; country: string };
	airport_to_details?: { city: string; iata_code: string; name: string; country_code: string; country: string };
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

export type PassengerType = 'adult' | 'child' | 'infant';

export interface BookingPassengerPayload {
	passenger_type: 'adult' | 'child' | 'infant';
	first_name: string;
	last_name: string;
	middle_name?: string | null;
	dob: string;
	gender: string;
	title: string;
	email: string;
	phone_number: string;
	documents: {
		number: string;
		expiry_date: string;
		issuing_country: string;
		nationality_country: string;
		document_type: string;
		holder: boolean;
	};
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
	access_code: string; // e.g., "9cwwmsgvek3rhed"
	tranx_reference: string; // e.g., "529368819863"
	authorization_url: string; // e.g., "https://checkout.paystack.com/..."
}

export interface VerifyPaymentData {
	status: number; // 200 = success
	service: string; // "flight"
	booking_id: string;
	flight_id: string;
}

export interface VerifyPaymentResponse {
	success: boolean;
	data: VerifyPaymentData;
	message: string;
}

export interface FinalizeBookingData {
	reference: string; // e.g., "TW-5IKU6JOE18"
	booking_id: string; // e.g., "502442798976"
	flight_id: string; // e.g., "mxa_383f7ae8-fd66-4f2b-98ba-6a85de6a7c0a"
	status: string; // e.g., "BOOKED"
}

export interface FinalizeBookingResponse {
	success: boolean;
	data: FinalizeBookingData;
	message: string;
}

export interface BookingDetails {
	reference: string;
	booking_id: string;
	flight_id: string;
	user_id: number;
	amount: string;
	payable_amount: string;
	currency: string;
	status: string;
	created_at: string;
	expires_at: string;
	outbound: OutboundSegment[];
	inbound: OutboundSegment[] | null;
	passengers: Passenger[];
	pricing: Pricing;
	pnr: string;
	total_duration: number;
}

export interface OutboundSegment {
	flight_number: string;
	airport_from: string;
	airport_to: string;
	departure_time: string;
	arrival_time: string;
	duration: number;
	cabin_type: string;
	baggage: string;
	airline_details: {
		name: string;
		code: string;
		logo: string;
	};
	airport_from_details: {
		city: string;
		name: string;
		country: string;
		iata_code: string;
	};
	airport_to_details: {
		city: string;
		name: string;
		country: string;
		iata_code: string;
	};
}

export interface Passenger {
	first_name: string;
	last_name: string;
	middle_name: string | null;
	email: string;
	phone_number: string;
	dob: string;
	gender: string;
	title: string;
	passenger_type: string;
	documents: {
		number: string;
		document_type: string;
		issuing_country: string;
		nationality_country: string;
		expiry_date: string;
		issuing_date: string;
		holder: boolean;
	};
}

export interface Pricing {
	base_fare: number;
	tax: number;
	markup: number | null;
	payable: number;
}

export interface PaymentGateway {
	service: string;
	logo: string;
	public_key?: string;
	secret_key?: string;
	is_active?: boolean;
}

export interface PaymentMethod {
	id: number;
	title: string;
	identifier: string;
	description: string;
	priority: number;
	status: 0 | 1;
	created_at: string;
	updated_at: string;
	interest_rate: number;
	instalments: string | null;
}

export interface BankAccount {
	bank_name: string;
	account_name: string;
	account_number: string;
	sort_code: string | null;
	status: number;
	bank: {
		id: number;
		name: string;
		code: string;
		ussdTemplate: string | null;
		baseUssdCode: string;
	};
}
