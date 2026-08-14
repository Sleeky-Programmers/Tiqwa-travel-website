// ============================================
// BASE TYPES
// ============================================

export interface WhitelabelResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

// ============================================
// SITE SETTINGS
// ============================================

export interface SiteSettings {
	name: string;
	long_name: string;
	logo: string | null;
	copyright: string;
	physical_address: string;
	site_url: string;
	site_domain: string;
	blog_url: string;
	facebook_link: string | null;
	instagram_link: string | null;
	linkedin_link: string | null;
	twitter_link: string | null;
	default_currency: string;
	phone_number: string;
	email_address: string;
	support_phone: string;
	support_email: string;
	maintenance_mode: number;
	payment_gateway: string | null;
	light_logo: string | null;
	primary_color: string | null;
	secondary_color: string | null;
	primary_lint_color: string | null;
	secondary_lint_color: string | null;
	tagline: string;
}

// ============================================
// HOMEPAGE TYPES
// ============================================

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

// ============================================
// FLIGHT & DEAL TYPES
// ============================================

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

export interface WhitelabelFlightItem {
	id: string;
	amount: number;
	currency: string;
	fare_basis?: string | null;
	outbound: OutboundSegment[];
	inbound?: OutboundSegment[];
	outbound_stops?: number;
	inbound_stops?: number;
	total_duration?: number;
	total_outbound_duration?: number;
	total_inbound_duration?: number | null;
	pricing?: Pricing;
	price_summary?: PriceSummary[];
	travelers_price?: TravelerPrice[];
}

export interface FlightSearchData {
	itemList: WhitelabelFlightItem[] | { message?: Record<string, string[]> };
	listing_id?: string;
}

// ============================================
// AIRPORT TYPES
// ============================================

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

// ============================================
// AIRPORT & AIRLINE DETAILS (Nested)
// ============================================

export interface AirportDetails {
	city: string;
	name: string;
	country: string;
	city_code: string;
	iata_code: string;
	country_code: string;
}

export interface AirlineDetails {
	code: string;
	logo: string;
	name: string;
}

export interface AirportSegment {
	airline_details?: AirlineDetails;
	airport_from?: string;
	airport_to?: string;
	airport_from_details?: AirportDetails;
	airport_to_details?: AirportDetails;
	departure_time: string;
	arrival_time: string;
	duration: number;
	flight_number?: string;
}

// ============================================
// OUTBOUND SEGMENT (Full)
// ============================================

export interface OutboundSegment {
	baggage: string;
	layover: string | null;
	duration: number;
	overnight: boolean;
	airport_to: string;
	cabin_type: string;
	airport_from: string;
	arrival_time: string;
	booking_class: string;
	flight_number: string;
	departure_time: string;
	equipment_type: string | null;
	marriage_group: string | null;
	airline_details: AirlineDetails;
	marketing_airline: string;
	operating_airline: string;
	airport_to_details: AirportDetails;
	airport_from_details: AirportDetails;
	fare_rules?: string[];
	refundable?: boolean;
}

// ============================================
// PASSENGER TYPES
// ============================================

export type PassengerType = 'adult' | 'child' | 'infant';

export interface PassengerDocument {
	holder: boolean;
	number: string;
	expiry_date: string;
	issuing_date: string;
	document_type: string;
	issuing_country: string;
	nationality_country: string;
}

export interface Passenger {
	dob: string;
	email: string;
	title: string;
	gender: string;
	documents: PassengerDocument;
	last_name: string;
	first_name: string;
	middle_name: string;
	phone_number: string;
	passenger_type: string;
}

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

// ============================================
// PRICING TYPES
// ============================================

export interface PriceSummary {
	quantity: number;
	total_price: number;
	passenger_type: string;
}

export interface TravelerPrice {
	[key: string]: number; // e.g., { adult: 122001 }
}

export interface Pricing {
	tax: number | null;
	markup: any[]; // Can be an array of markup objects
	payable: number;
	base_fare: number | null;
}

export interface ConfirmPriceData {
	amount?: number;
	currency?: string;
	id?: string;
}

// ============================================
// BOOKING TYPES
// ============================================

export interface BookingDetails {
	reference: string;
	flight_id: string;
	booking_id: string;
	user_id: number;
	amount: string;
	payable_amount: string;
	bookable_seats: number;
	ticket_number: string | null;
	booking_account: string;
	created_at: string;
	currency: string;
	document_required: string | null;
	expires_at: string;
	fare_basis: string | null;
	outbound: OutboundSegment[];
	inbound: OutboundSegment[] | null;
	routes: string | null;
	query_type: 'one_way' | 'roundtrip' | string;
	inbound_stops: number | null;
	issue_account: string | null;
	outbound_stops: number | null;
	pnr: string | null;
	price_change: string | null;
	price_summary: PriceSummary[];
	pricing: Pricing;
	status: string;
	total_duration: number;
	total_inbound_duration: number | null;
	total_outbound_duration: number;
	travelers_price: TravelerPrice[];
	passengers: Passenger[];
	ticket_issued: number | boolean;
	flight_addons: string | null;
	payment: string | null;
	attendee: string | null;
	updated_at: string;
}

export interface CreateBookingData {
	booking_id: string;
	reference: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentInitiateData {
	access_code: string;
	tranx_reference: string;
	authorization_url: string;
}

export interface VerifyPaymentData {
	status: number;
	service: string;
	booking_id: string;
	flight_id: string;
}

export interface VerifyPaymentResponse {
	success: boolean;
	data: VerifyPaymentData;
	message: string;
}

export interface FinalizeBookingData {
	reference: string;
	booking_id: string;
	flight_id: string;
	status: string;
}

export interface FinalizeBookingResponse {
	success: boolean;
	data: FinalizeBookingData;
	message: string;
}

// ============================================
// PAYMENT GATEWAY & METHOD TYPES
// ============================================

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
