export type BookingStatus = 'PAID' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';

export interface AdminStats {
	totalBookings: number;
	totalCustomers: number;
	totalRevenue: number;
	pendingBookings: number;
}

export interface PriceBreakdown {
	base_fare: number;
	taxes: number;
	total: number;
}

export interface PassengerDetail {
	name: string;
	type: 'adult' | 'child' | 'infant';
	dob: string;
	document_number?: string;
}

export interface AdminBooking {
	id: number;
	reference: string;
	customer: string;
	email: string;
	amount: number;
	status: BookingStatus;
	booking_date: string;
	route: string;
	airline: string;
	passengers: number;
	departure_date?: string;
	return_date?: string;
	price_breakdown?: PriceBreakdown;
	passenger_details?: PassengerDetail[];
}

export interface AdminCustomer {
	id: number;
	name: string;
	email: string;
	phone_number: string;
	loyalty_reward: number;
	date_of_birth: string;
	gender: string;
	bookings_count: number;
	joined_date?: string;
	bookings?: AdminBooking[];
}

export interface RecentActivity {
	id: number;
	description: string;
	performed_by: string;
	human_time: string;
}

function buildPriceBreakdown(amount: number): PriceBreakdown {
	const base_fare = Math.round(amount * 0.87 * 100) / 100;
	const taxes = Math.round((amount - base_fare) * 100) / 100;
	return { base_fare, taxes, total: amount };
}

export const adminStats: AdminStats = {
	totalBookings: 156,
	totalCustomers: 342,
	totalRevenue: 2847500,
	pendingBookings: 12,
};

export const recentActivities: RecentActivity[] = [
	{ id: 1, description: 'Administrator updated payment gateway', performed_by: 'Admin John', human_time: '5 minutes ago' },
	{ id: 2, description: 'New booking created by Shiloh George', performed_by: 'System', human_time: '12 minutes ago' },
	{ id: 3, description: 'Booking TW-KL9M2PQR1A marked as PAID', performed_by: 'Payment Gateway', human_time: '28 minutes ago' },
	{ id: 4, description: 'Customer profile updated for Ada Okonkwo', performed_by: 'Admin Sarah', human_time: '1 hour ago' },
	{ id: 5, description: 'Booking TW-XF3N8TUV2B cancelled by customer', performed_by: 'System', human_time: '2 hours ago' },
	{ id: 6, description: 'Loyalty reward credited to Emeka Nwosu', performed_by: 'System', human_time: '3 hours ago' },
	{ id: 7, description: 'New customer registration: Fatima Bello', performed_by: 'System', human_time: '4 hours ago' },
	{ id: 8, description: 'Refund processed for booking TW-PL7Q2RST3C', performed_by: 'Admin John', human_time: '5 hours ago' },
	{ id: 9, description: 'Flight schedule updated for LOS → ABV route', performed_by: 'Admin Sarah', human_time: '6 hours ago' },
	{ id: 10, description: 'Weekly revenue report generated', performed_by: 'System', human_time: '8 hours ago' },
];

export const adminBookings: AdminBooking[] = [
	{
		id: 1,
		reference: 'TW-UT0GAM4A66',
		customer: 'Shiloh George',
		email: 'shiloh.george@email.com',
		amount: 119803.5,
		status: 'PAID',
		booking_date: '2026-07-01',
		route: 'LOS → ABV',
		airline: 'Air Peace',
		passengers: 1,
		departure_date: '2026-07-15',
		price_breakdown: buildPriceBreakdown(119803.5),
		passenger_details: [{ name: 'Shiloh George', type: 'adult', dob: '2003-05-14', document_number: 'A12345678' }],
	},
	{
		id: 2,
		reference: 'TW-KL9M2PQR1A',
		customer: 'Ada Okonkwo',
		email: 'ada.okonkwo@email.com',
		amount: 245600,
		status: 'PAID',
		booking_date: '2026-06-28',
		route: 'LOS → ABV',
		airline: 'United Nigeria',
		passengers: 2,
		departure_date: '2026-07-20',
		return_date: '2026-07-27',
		price_breakdown: buildPriceBreakdown(245600),
		passenger_details: [
			{ name: 'Ada Okonkwo', type: 'adult', dob: '1990-08-22', document_number: 'B23456789' },
			{ name: 'Chukwu Okonkwo', type: 'adult', dob: '1988-03-10', document_number: 'B23456790' },
		],
	},
	{
		id: 3,
		reference: 'TW-XF3N8TUV2B',
		customer: 'Emeka Nwosu',
		email: 'emeka.nwosu@email.com',
		amount: 89500,
		status: 'CANCELLED',
		booking_date: '2026-06-25',
		route: 'LOS → ACC',
		airline: 'Air Peace',
		passengers: 1,
		departure_date: '2026-07-10',
		price_breakdown: buildPriceBreakdown(89500),
		passenger_details: [{ name: 'Emeka Nwosu', type: 'adult', dob: '1988-12-03', document_number: 'C34567890' }],
	},
	{
		id: 4,
		reference: 'TW-PL7Q2RST3C',
		customer: 'Fatima Bello',
		email: 'fatima.bello@email.com',
		amount: 178250,
		status: 'PENDING_PAYMENT',
		booking_date: '2026-07-02',
		route: 'LOS → DXB',
		airline: 'Emirates',
		passengers: 1,
		departure_date: '2026-08-01',
		price_breakdown: buildPriceBreakdown(178250),
		passenger_details: [{ name: 'Fatima Bello', type: 'adult', dob: '1995-03-18', document_number: 'D45678901' }],
	},
	{
		id: 5,
		reference: 'TW-HJ4K6LMN5D',
		customer: 'Chidi Okafor',
		email: 'chidi.okafor@email.com',
		amount: 312400,
		status: 'CONFIRMED',
		booking_date: '2026-06-30',
		route: 'LOS → LHR',
		airline: 'KLM',
		passengers: 2,
		departure_date: '2026-08-15',
		return_date: '2026-08-30',
		price_breakdown: buildPriceBreakdown(312400),
		passenger_details: [
			{ name: 'Chidi Okafor', type: 'adult', dob: '1985-11-30', document_number: 'E56789012' },
			{ name: 'Amara Okafor', type: 'adult', dob: '1987-06-14', document_number: 'E56789013' },
		],
	},
	{
		id: 6,
		reference: 'TW-WQ8R9STU6E',
		customer: 'Blessing Eze',
		email: 'blessing.eze@email.com',
		amount: 67200,
		status: 'PAID',
		booking_date: '2026-06-22',
		route: 'LOS → ABV',
		airline: 'Air Peace',
		passengers: 1,
		departure_date: '2026-07-08',
		price_breakdown: buildPriceBreakdown(67200),
		passenger_details: [{ name: 'Blessing Eze', type: 'adult', dob: '1992-07-07', document_number: 'F67890123' }],
	},
	{
		id: 7,
		reference: 'TW-YZ1A2BCD7F',
		customer: 'Ibrahim Musa',
		email: 'ibrahim.musa@email.com',
		amount: 456800,
		status: 'CONFIRMED',
		booking_date: '2026-07-03',
		route: 'LOS → DXB',
		airline: 'Emirates',
		passengers: 1,
		departure_date: '2026-09-05',
		price_breakdown: buildPriceBreakdown(456800),
		passenger_details: [{ name: 'Ibrahim Musa', type: 'adult', dob: '1980-01-25', document_number: 'G78901234' }],
	},
	{
		id: 8,
		reference: 'TW-EF3G4HIJ8G',
		customer: 'Ngozi Adeyemi',
		email: 'ngozi.adeyemi@email.com',
		amount: 98400,
		status: 'PENDING_PAYMENT',
		booking_date: '2026-07-04',
		route: 'LOS → ABV',
		airline: 'United Nigeria',
		passengers: 1,
		departure_date: '2026-07-18',
		price_breakdown: buildPriceBreakdown(98400),
		passenger_details: [{ name: 'Ngozi Adeyemi', type: 'adult', dob: '1998-09-12', document_number: 'H89012345' }],
	},
	{
		id: 9,
		reference: 'TW-KL5M6NOP9H',
		customer: 'Tunde Bakare',
		email: 'tunde.bakare@email.com',
		amount: 845000,
		status: 'PAID',
		booking_date: '2026-06-18',
		route: 'LOS → JFK',
		airline: 'KLM',
		passengers: 3,
		departure_date: '2026-08-20',
		return_date: '2026-09-05',
		price_breakdown: buildPriceBreakdown(845000),
		passenger_details: [
			{ name: 'Tunde Bakare', type: 'adult', dob: '1978-04-05', document_number: 'J90123456' },
			{ name: 'Funke Bakare', type: 'adult', dob: '1980-09-20', document_number: 'J90123457' },
			{ name: 'Kemi Bakare', type: 'child', dob: '2015-02-08', document_number: 'J90123458' },
		],
	},
	{
		id: 10,
		reference: 'TW-QR7S8TUV0I',
		customer: 'Amina Hassan',
		email: 'amina.hassan@email.com',
		amount: 52800,
		status: 'PAID',
		booking_date: '2026-06-15',
		route: 'LOS → ABV',
		airline: 'Air Peace',
		passengers: 1,
		departure_date: '2026-07-05',
		price_breakdown: buildPriceBreakdown(52800),
		passenger_details: [{ name: 'Amina Hassan', type: 'adult', dob: '2000-06-28', document_number: 'K01234567' }],
	},
	{
		id: 11,
		reference: 'TW-WX9Y0ZAB1J',
		customer: 'David Ogunleye',
		email: 'david.ogunleye@email.com',
		amount: 134500,
		status: 'CANCELLED',
		booking_date: '2026-06-10',
		route: 'LOS → ACC',
		airline: 'Ethiopian',
		passengers: 2,
		departure_date: '2026-07-12',
		price_breakdown: buildPriceBreakdown(134500),
		passenger_details: [
			{ name: 'David Ogunleye', type: 'adult', dob: '1991-10-15', document_number: 'L12345678' },
			{ name: 'Bisi Ogunleye', type: 'adult', dob: '1993-04-22', document_number: 'L12345679' },
		],
	},
	{
		id: 12,
		reference: 'TW-CD2E3FGH4K',
		customer: 'Grace Akpan',
		email: 'grace.akpan@email.com',
		amount: 78900,
		status: 'CONFIRMED',
		booking_date: '2026-07-05',
		route: 'LOS → ABV',
		airline: 'United Nigeria',
		passengers: 1,
		departure_date: '2026-07-22',
		price_breakdown: buildPriceBreakdown(78900),
		passenger_details: [{ name: 'Grace Akpan', type: 'adult', dob: '1994-02-20', document_number: 'M23456789' }],
	},
	{
		id: 13,
		reference: 'TW-LM5N6OPQ7L',
		customer: 'Yusuf Abdullahi',
		email: 'yusuf.abdullahi@email.com',
		amount: 201300,
		status: 'PENDING_PAYMENT',
		booking_date: '2026-07-06',
		route: 'LOS → DXB',
		airline: 'Emirates',
		passengers: 1,
		departure_date: '2026-09-10',
		price_breakdown: buildPriceBreakdown(201300),
		passenger_details: [{ name: 'Yusuf Abdullahi', type: 'adult', dob: '1986-07-19', document_number: 'N34567890' }],
	},
	{
		id: 14,
		reference: 'TW-RS8T9UVW0M',
		customer: 'Chioma Ibe',
		email: 'chioma.ibe@email.com',
		amount: 112600,
		status: 'PAID',
		booking_date: '2026-06-08',
		route: 'LOS → ABV',
		airline: 'Air Peace',
		passengers: 2,
		departure_date: '2026-06-25',
		price_breakdown: buildPriceBreakdown(112600),
		passenger_details: [
			{ name: 'Chioma Ibe', type: 'adult', dob: '1996-11-08', document_number: 'O45678901' },
			{ name: 'Ifeanyi Ibe', type: 'adult', dob: '1994-01-30', document_number: 'O45678902' },
		],
	},
	{
		id: 15,
		reference: 'TW-XY1Z2ABC3N',
		customer: 'Samuel Etim',
		email: 'samuel.etim@email.com',
		amount: 567800,
		status: 'CONFIRMED',
		booking_date: '2026-07-02',
		route: 'LOS → LHR',
		airline: 'KLM',
		passengers: 1,
		departure_date: '2026-07-28',
		price_breakdown: buildPriceBreakdown(567800),
		passenger_details: [{ name: 'Samuel Etim', type: 'adult', dob: '1983-05-25', document_number: 'P56789012' }],
	},
	{
		id: 16,
		reference: 'TW-DE4F5GHI6O',
		customer: 'Halima Yusuf',
		email: 'halima.yusuf@email.com',
		amount: 93400,
		status: 'PAID',
		booking_date: '2026-06-20',
		route: 'LOS → ABV',
		airline: 'United Nigeria',
		passengers: 1,
		departure_date: '2026-07-14',
		price_breakdown: buildPriceBreakdown(93400),
		passenger_details: [{ name: 'Halima Yusuf', type: 'adult', dob: '1997-08-11', document_number: 'Q67890123' }],
	},
	{
		id: 17,
		reference: 'TW-JK7L8MNO9P',
		customer: 'Peter Okorie',
		email: 'peter.okorie@email.com',
		amount: 289500,
		status: 'PENDING_PAYMENT',
		booking_date: '2026-07-07',
		route: 'LOS → JFK',
		airline: 'KLM',
		passengers: 2,
		departure_date: '2026-09-01',
		return_date: '2026-09-15',
		price_breakdown: buildPriceBreakdown(289500),
		passenger_details: [
			{ name: 'Peter Okorie', type: 'adult', dob: '1975-12-01', document_number: 'R78901234' },
			{ name: 'Nneka Okorie', type: 'adult', dob: '1978-06-18', document_number: 'R78901235' },
		],
	},
	{
		id: 18,
		reference: 'TW-QR0S1TUV2Q',
		customer: 'Maryam Aliyu',
		email: 'maryam.aliyu@email.com',
		amount: 55600,
		status: 'PAID',
		booking_date: '2026-06-05',
		route: 'LOS → ABV',
		airline: 'Air Peace',
		passengers: 1,
		departure_date: '2026-06-30',
		price_breakdown: buildPriceBreakdown(55600),
		passenger_details: [{ name: 'Maryam Aliyu', type: 'adult', dob: '1999-03-27', document_number: 'S89012345' }],
	},
	{
		id: 19,
		reference: 'TW-AB3C4DEF5R',
		customer: 'Oluwaseun Adebayo',
		email: 'oluwaseun.adebayo@email.com',
		amount: 1180000,
		status: 'CONFIRMED',
		booking_date: '2026-07-08',
		route: 'LOS → JFK',
		airline: 'KLM',
		passengers: 4,
		departure_date: '2026-10-01',
		return_date: '2026-10-20',
		price_breakdown: buildPriceBreakdown(1180000),
		passenger_details: [
			{ name: 'Oluwaseun Adebayo', type: 'adult', dob: '1982-04-16', document_number: 'T90123456' },
			{ name: 'Tolu Adebayo', type: 'adult', dob: '1984-09-03', document_number: 'T90123457' },
			{ name: 'Tomi Adebayo', type: 'child', dob: '2012-11-20', document_number: 'T90123458' },
			{ name: 'Tayo Adebayo', type: 'infant', dob: '2024-06-05' },
		],
	},
	{
		id: 20,
		reference: 'TW-GH6I7JKL8S',
		customer: 'Zainab Mohammed',
		email: 'zainab.mohammed@email.com',
		amount: 156400,
		status: 'PAID',
		booking_date: '2026-06-12',
		route: 'LOS → ACC',
		airline: 'Ethiopian',
		passengers: 1,
		departure_date: '2026-07-25',
		price_breakdown: buildPriceBreakdown(156400),
		passenger_details: [{ name: 'Zainab Mohammed', type: 'adult', dob: '1993-01-09', document_number: 'U01234567' }],
	},
	{
		id: 21,
		reference: 'TW-MN9O0PQR1T',
		customer: 'Kelechi Nnamdi',
		email: 'kelechi.nnamdi@email.com',
		amount: 723500,
		status: 'CONFIRMED',
		booking_date: '2026-07-09',
		route: 'LOS → LHR',
		airline: 'KLM',
		passengers: 2,
		departure_date: '2026-08-28',
		return_date: '2026-09-12',
		price_breakdown: buildPriceBreakdown(723500),
		passenger_details: [
			{ name: 'Kelechi Nnamdi', type: 'adult', dob: '1989-07-22', document_number: 'V12345678' },
			{ name: 'Adaeze Nnamdi', type: 'adult', dob: '1991-12-14', document_number: 'V12345679' },
		],
	},
	{
		id: 22,
		reference: 'TW-UV2W3XYZ4U',
		customer: 'Hauwa Suleiman',
		email: 'hauwa.suleiman@email.com',
		amount: 389200,
		status: 'CONFIRMED',
		booking_date: '2026-07-10',
		route: 'LOS → DXB',
		airline: 'Emirates',
		passengers: 2,
		departure_date: '2026-09-18',
		price_breakdown: buildPriceBreakdown(389200),
		passenger_details: [
			{ name: 'Hauwa Suleiman', type: 'adult', dob: '1990-10-30', document_number: 'W23456789' },
			{ name: 'Aisha Suleiman', type: 'child', dob: '2016-05-12', document_number: 'W23456790' },
		],
	},
];

export const adminCustomers: AdminCustomer[] = [
	{
		id: 1,
		name: 'Shiloh George',
		email: 'shiloh.george@email.com',
		phone_number: '+2348151380885',
		loyalty_reward: 150,
		date_of_birth: '2003-05-14',
		gender: 'male',
		bookings_count: 3,
		joined_date: '2024-03-12',
	},
	{
		id: 2,
		name: 'Ada Okonkwo',
		email: 'ada.okonkwo@email.com',
		phone_number: '+2348034567890',
		loyalty_reward: 280,
		date_of_birth: '1990-08-22',
		gender: 'female',
		bookings_count: 5,
		joined_date: '2023-11-05',
	},
	{
		id: 3,
		name: 'Emeka Nwosu',
		email: 'emeka.nwosu@email.com',
		phone_number: '+2347012345678',
		loyalty_reward: 95,
		date_of_birth: '1988-12-03',
		gender: 'male',
		bookings_count: 2,
		joined_date: '2024-06-18',
	},
	{
		id: 4,
		name: 'Fatima Bello',
		email: 'fatima.bello@email.com',
		phone_number: '+2349098765432',
		loyalty_reward: 45,
		date_of_birth: '1995-03-18',
		gender: 'female',
		bookings_count: 1,
		joined_date: '2025-09-22',
	},
	{
		id: 5,
		name: 'Chidi Okafor',
		email: 'chidi.okafor@email.com',
		phone_number: '+2348123456789',
		loyalty_reward: 420,
		date_of_birth: '1985-11-30',
		gender: 'male',
		bookings_count: 7,
		joined_date: '2023-02-14',
	},
	{
		id: 6,
		name: 'Blessing Eze',
		email: 'blessing.eze@email.com',
		phone_number: '+2348076543210',
		loyalty_reward: 120,
		date_of_birth: '1992-07-07',
		gender: 'female',
		bookings_count: 2,
		joined_date: '2024-08-30',
	},
	{
		id: 7,
		name: 'Ibrahim Musa',
		email: 'ibrahim.musa@email.com',
		phone_number: '+2348065432109',
		loyalty_reward: 310,
		date_of_birth: '1980-01-25',
		gender: 'male',
		bookings_count: 4,
		joined_date: '2023-07-08',
	},
	{
		id: 8,
		name: 'Ngozi Adeyemi',
		email: 'ngozi.adeyemi@email.com',
		phone_number: '+2348054321098',
		loyalty_reward: 75,
		date_of_birth: '1998-09-12',
		gender: 'female',
		bookings_count: 1,
		joined_date: '2025-11-01',
	},
	{
		id: 9,
		name: 'Tunde Bakare',
		email: 'tunde.bakare@email.com',
		phone_number: '+2348043210987',
		loyalty_reward: 500,
		date_of_birth: '1978-04-05',
		gender: 'male',
		bookings_count: 8,
		joined_date: '2022-12-20',
	},
	{
		id: 10,
		name: 'Amina Hassan',
		email: 'amina.hassan@email.com',
		phone_number: '+2348032109876',
		loyalty_reward: 88,
		date_of_birth: '2000-06-28',
		gender: 'female',
		bookings_count: 2,
		joined_date: '2024-05-17',
	},
	{
		id: 11,
		name: 'David Ogunleye',
		email: 'david.ogunleye@email.com',
		phone_number: '+2348021098765',
		loyalty_reward: 200,
		date_of_birth: '1991-10-15',
		gender: 'male',
		bookings_count: 3,
		joined_date: '2024-01-09',
	},
	{
		id: 12,
		name: 'Grace Akpan',
		email: 'grace.akpan@email.com',
		phone_number: '+2348010987654',
		loyalty_reward: 165,
		date_of_birth: '1994-02-20',
		gender: 'female',
		bookings_count: 2,
		joined_date: '2024-04-25',
	},
	{
		id: 13,
		name: 'Oluwaseun Adebayo',
		email: 'oluwaseun.adebayo@email.com',
		phone_number: '+2348098761234',
		loyalty_reward: 380,
		date_of_birth: '1982-04-16',
		gender: 'male',
		bookings_count: 6,
		joined_date: '2023-05-03',
	},
	{
		id: 14,
		name: 'Zainab Mohammed',
		email: 'zainab.mohammed@email.com',
		phone_number: '+2348087654321',
		loyalty_reward: 110,
		date_of_birth: '1993-01-09',
		gender: 'female',
		bookings_count: 2,
		joined_date: '2024-10-11',
	},
	{
		id: 15,
		name: 'Kelechi Nnamdi',
		email: 'kelechi.nnamdi@email.com',
		phone_number: '+2348076543219',
		loyalty_reward: 245,
		date_of_birth: '1989-07-22',
		gender: 'male',
		bookings_count: 4,
		joined_date: '2023-09-28',
	},
];

export const bookingStatusMap: Record<BookingStatus, { label: string; className: string }> = {
	PAID: { label: 'Paid', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
	PENDING_PAYMENT: { label: 'Pending Payment', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
	CONFIRMED: { label: 'Confirmed', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
	CANCELLED: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

export const statusBadgeStyles: Record<BookingStatus, string> = {
	PAID: bookingStatusMap.PAID.className,
	PENDING_PAYMENT: bookingStatusMap.PENDING_PAYMENT.className,
	CONFIRMED: bookingStatusMap.CONFIRMED.className,
	CANCELLED: bookingStatusMap.CANCELLED.className,
};

export const statusLabels: Record<BookingStatus, string> = {
	PAID: bookingStatusMap.PAID.label,
	PENDING_PAYMENT: bookingStatusMap.PENDING_PAYMENT.label,
	CONFIRMED: bookingStatusMap.CONFIRMED.label,
	CANCELLED: bookingStatusMap.CANCELLED.label,
};

export const bookingStatusOptions = [
	{ value: 'ALL', label: 'All Statuses' },
	{ value: 'PAID', label: 'Paid' },
	{ value: 'PENDING_PAYMENT', label: 'Pending Payment' },
	{ value: 'CONFIRMED', label: 'Confirmed' },
	{ value: 'CANCELLED', label: 'Cancelled' },
];

export function getBookingById(id: number): AdminBooking | undefined {
	return adminBookings.find((b) => b.id === id);
}

export function getCustomerByEmail(email: string): AdminCustomer | undefined {
	return adminCustomers.find((c) => c.email === email);
}

export function getCustomerBookings(email: string): AdminBooking[] {
	return adminBookings.filter((b) => b.email === email);
}

export function formatNaira(amount: number): string {
	return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ====== PAYMENTS ======

export interface AdminPayment {
	id: number;
	reference: string;
	order_reference: string;
	payment_for: 'flight' | 'hotel' | 'package';
	amount: number;
	amount_settled: number;
	payment_method: 'CARD' | 'ONLINE_TRANSFER' | 'FLEXI_PAY' | 'WALK_IN_TRANSFER';
	payment_gateway: 'paystack' | 'flutterwave' | 'skipcash';
	status: 'Pending' | 'Paid' | 'Failed';
	paid_at: string | null;
	created_at: string;
	booking_id?: string;
	gateway_response?: {
		code: string;
		message: string;
	};
	flexi_pay_details?: {
		payable_amount: number;
		total_paid: number;
		next_pay_date: string | null;
		flexi_pay_dates: Array<{
			id: number;
			date: string;
			amount: number;
		}>;
	};
}

export const adminPayments: AdminPayment[] = [
	{
		id: 1,
		reference: 'PAY-2026-001',
		order_reference: 'TW-UT0GAM4A66',
		payment_for: 'flight',
		amount: 119803.5,
		amount_settled: 119203.5,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-07-01T14:30:00Z',
		created_at: '2026-07-01T14:25:00Z',
		booking_id: 'BK-2026-001',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 2,
		reference: 'PAY-2026-002',
		order_reference: 'TW-KL9M2PQR1A',
		payment_for: 'flight',
		amount: 245600.0,
		amount_settled: 244800.0,
		payment_method: 'ONLINE_TRANSFER',
		payment_gateway: 'flutterwave',
		status: 'Paid',
		paid_at: '2026-06-28T10:15:00Z',
		created_at: '2026-06-28T10:00:00Z',
		booking_id: 'BK-2026-002',
		gateway_response: { code: '00', message: 'Success' },
	},
	{
		id: 3,
		reference: 'PAY-2026-003',
		order_reference: 'TW-XF3N8TUV2B',
		payment_for: 'flight',
		amount: 89500.0,
		amount_settled: 0.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Failed',
		paid_at: null,
		created_at: '2026-06-25T09:30:00Z',
		booking_id: 'BK-2026-003',
		gateway_response: { code: '05', message: 'Declined' },
	},
	{
		id: 4,
		reference: 'PAY-2026-004',
		order_reference: 'TW-PL7Q2RST3C',
		payment_for: 'flight',
		amount: 178250.0,
		amount_settled: 0.0,
		payment_method: 'WALK_IN_TRANSFER',
		payment_gateway: 'skipcash',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-07-02T08:45:00Z',
		booking_id: 'BK-2026-004',
	},
	{
		id: 5,
		reference: 'PAY-2026-005',
		order_reference: 'TW-HJ4K6LMN5D',
		payment_for: 'flight',
		amount: 312400.0,
		amount_settled: 311200.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-06-30T16:20:00Z',
		created_at: '2026-06-30T16:00:00Z',
		booking_id: 'BK-2026-005',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 6,
		reference: 'PAY-2026-006',
		order_reference: 'TW-WQ8R9STU6E',
		payment_for: 'flight',
		amount: 67200.0,
		amount_settled: 66900.0,
		payment_method: 'ONLINE_TRANSFER',
		payment_gateway: 'flutterwave',
		status: 'Paid',
		paid_at: '2026-06-22T11:30:00Z',
		created_at: '2026-06-22T11:15:00Z',
		booking_id: 'BK-2026-006',
		gateway_response: { code: '00', message: 'Success' },
	},
	{
		id: 7,
		reference: 'PAY-2026-007',
		order_reference: 'TW-YZ1A2BCD7F',
		payment_for: 'flight',
		amount: 456800.0,
		amount_settled: 455000.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-07-03T09:45:00Z',
		created_at: '2026-07-03T09:30:00Z',
		booking_id: 'BK-2026-007',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 8,
		reference: 'PAY-2026-008',
		order_reference: 'TW-EF3G4HIJ8G',
		payment_for: 'flight',
		amount: 98400.0,
		amount_settled: 0.0,
		payment_method: 'WALK_IN_TRANSFER',
		payment_gateway: 'skipcash',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-07-04T13:20:00Z',
		booking_id: 'BK-2026-008',
	},
	{
		id: 9,
		reference: 'PAY-2026-009',
		order_reference: 'TW-KL5M6NOP9H',
		payment_for: 'flight',
		amount: 845000.0,
		amount_settled: 842500.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-06-18T10:00:00Z',
		created_at: '2026-06-18T09:45:00Z',
		booking_id: 'BK-2026-009',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 10,
		reference: 'PAY-2026-010',
		order_reference: 'TW-QR7S8TUV0I',
		payment_for: 'flight',
		amount: 52800.0,
		amount_settled: 52500.0,
		payment_method: 'ONLINE_TRANSFER',
		payment_gateway: 'flutterwave',
		status: 'Paid',
		paid_at: '2026-06-15T08:30:00Z',
		created_at: '2026-06-15T08:15:00Z',
		booking_id: 'BK-2026-010',
		gateway_response: { code: '00', message: 'Success' },
	},
	{
		id: 11,
		reference: 'PAY-2026-011',
		order_reference: 'TW-WX9Y0ZAB1J',
		payment_for: 'flight',
		amount: 134500.0,
		amount_settled: 0.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Failed',
		paid_at: null,
		created_at: '2026-06-10T14:50:00Z',
		booking_id: 'BK-2026-011',
		gateway_response: { code: '04', message: 'Card expired' },
	},
	{
		id: 12,
		reference: 'PAY-2026-012',
		order_reference: 'TW-CD2E3FGH4K',
		payment_for: 'flight',
		amount: 78900.0,
		amount_settled: 0.0,
		payment_method: 'WALK_IN_TRANSFER',
		payment_gateway: 'skipcash',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-07-05T10:00:00Z',
		booking_id: 'BK-2026-012',
	},
	{
		id: 13,
		reference: 'PAY-2026-013',
		order_reference: 'TW-LM5N6OPQ7L',
		payment_for: 'flight',
		amount: 201300.0,
		amount_settled: 0.0,
		payment_method: 'FLEXI_PAY',
		payment_gateway: 'paystack',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-07-06T11:30:00Z',
		booking_id: 'BK-2026-013',
		flexi_pay_details: {
			payable_amount: 201300.0,
			total_paid: 50325.0,
			next_pay_date: '2026-08-06T00:00:00Z',
			flexi_pay_dates: [
				{ id: 1, date: '2026-07-06T00:00:00Z', amount: 50325.0 },
				{ id: 2, date: '2026-08-06T00:00:00Z', amount: 50325.0 },
				{ id: 3, date: '2026-09-06T00:00:00Z', amount: 50325.0 },
				{ id: 4, date: '2026-10-06T00:00:00Z', amount: 50325.0 },
			],
		},
	},
	{
		id: 14,
		reference: 'PAY-2026-014',
		order_reference: 'TW-RS8T9UVW0M',
		payment_for: 'flight',
		amount: 112600.0,
		amount_settled: 112100.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-06-08T13:45:00Z',
		created_at: '2026-06-08T13:30:00Z',
		booking_id: 'BK-2026-014',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 15,
		reference: 'PAY-2026-015',
		order_reference: 'TW-XY1Z2ABC3N',
		payment_for: 'flight',
		amount: 567800.0,
		amount_settled: 565500.0,
		payment_method: 'FLEXI_PAY',
		payment_gateway: 'flutterwave',
		status: 'Paid',
		paid_at: '2026-07-02T15:00:00Z',
		created_at: '2026-07-02T14:30:00Z',
		booking_id: 'BK-2026-015',
		flexi_pay_details: {
			payable_amount: 567800.0,
			total_paid: 567800.0,
			next_pay_date: null,
			flexi_pay_dates: [
				{ id: 1, date: '2026-07-02T00:00:00Z', amount: 141950.0 },
				{ id: 2, date: '2026-07-16T00:00:00Z', amount: 141950.0 },
				{ id: 3, date: '2026-07-30T00:00:00Z', amount: 141950.0 },
				{ id: 4, date: '2026-08-13T00:00:00Z', amount: 141950.0 },
			],
		},
	},
	{
		id: 16,
		reference: 'PAY-2026-016',
		order_reference: 'TW-DE4F5GHI6O',
		payment_for: 'flight',
		amount: 93400.0,
		amount_settled: 0.0,
		payment_method: 'ONLINE_TRANSFER',
		payment_gateway: 'flutterwave',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-06-20T16:00:00Z',
		booking_id: 'BK-2026-016',
	},
	{
		id: 17,
		reference: 'PAY-2026-017',
		order_reference: 'TW-JK7L8MNO9P',
		payment_for: 'flight',
		amount: 289500.0,
		amount_settled: 0.0,
		payment_method: 'FLEXI_PAY',
		payment_gateway: 'paystack',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-07-07T09:00:00Z',
		booking_id: 'BK-2026-017',
		flexi_pay_details: {
			payable_amount: 289500.0,
			total_paid: 72375.0,
			next_pay_date: '2026-08-07T00:00:00Z',
			flexi_pay_dates: [
				{ id: 1, date: '2026-07-07T00:00:00Z', amount: 72375.0 },
				{ id: 2, date: '2026-08-07T00:00:00Z', amount: 72375.0 },
				{ id: 3, date: '2026-09-07T00:00:00Z', amount: 72375.0 },
				{ id: 4, date: '2026-10-07T00:00:00Z', amount: 72375.0 },
			],
		},
	},
	{
		id: 18,
		reference: 'PAY-2026-018',
		order_reference: 'TW-QR0S1TUV2Q',
		payment_for: 'flight',
		amount: 55600.0,
		amount_settled: 55300.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-06-05T12:00:00Z',
		created_at: '2026-06-05T11:45:00Z',
		booking_id: 'BK-2026-018',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 19,
		reference: 'PAY-2026-019',
		order_reference: 'TW-AB3C4DEF5R',
		payment_for: 'flight',
		amount: 1180000.0,
		amount_settled: 1175000.0,
		payment_method: 'ONLINE_TRANSFER',
		payment_gateway: 'flutterwave',
		status: 'Paid',
		paid_at: '2026-07-08T14:30:00Z',
		created_at: '2026-07-08T14:00:00Z',
		booking_id: 'BK-2026-019',
		gateway_response: { code: '00', message: 'Success' },
	},
	{
		id: 20,
		reference: 'PAY-2026-020',
		order_reference: 'TW-GH6I7JKL8S',
		payment_for: 'flight',
		amount: 156400.0,
		amount_settled: 0.0,
		payment_method: 'WALK_IN_TRANSFER',
		payment_gateway: 'skipcash',
		status: 'Pending',
		paid_at: null,
		created_at: '2026-06-12T10:30:00Z',
		booking_id: 'BK-2026-020',
	},
	{
		id: 21,
		reference: 'PAY-2026-021',
		order_reference: 'TW-MN9O0PQR1T',
		payment_for: 'flight',
		amount: 723500.0,
		amount_settled: 721000.0,
		payment_method: 'CARD',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-07-09T11:20:00Z',
		created_at: '2026-07-09T11:00:00Z',
		booking_id: 'BK-2026-021',
		gateway_response: { code: '00', message: 'Approved' },
	},
	{
		id: 22,
		reference: 'PAY-2026-022',
		order_reference: 'TW-UV2W3XYZ4U',
		payment_for: 'flight',
		amount: 389200.0,
		amount_settled: 387800.0,
		payment_method: 'FLEXI_PAY',
		payment_gateway: 'paystack',
		status: 'Paid',
		paid_at: '2026-07-10T08:45:00Z',
		created_at: '2026-07-10T08:30:00Z',
		booking_id: 'BK-2026-022',
		flexi_pay_details: {
			payable_amount: 389200.0,
			total_paid: 389200.0,
			next_pay_date: null,
			flexi_pay_dates: [
				{ id: 1, date: '2026-07-10T00:00:00Z', amount: 97300.0 },
				{ id: 2, date: '2026-07-24T00:00:00Z', amount: 97300.0 },
				{ id: 3, date: '2026-08-07T00:00:00Z', amount: 97300.0 },
				{ id: 4, date: '2026-08-21T00:00:00Z', amount: 97300.0 },
			],
		},
	},
];

// Filter Flexi-Pay payments
export const adminFlexiPayments: AdminPayment[] = adminPayments.filter((p) => p.payment_method === 'FLEXI_PAY');
