'use client';

import { format, isValid, parseISO } from 'date-fns';
import { Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { AdminFilters } from '@/components/admin/AdminFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTable } from '@/components/admin/AdminTable';
import { BookingDetailsModal } from '@/components/admin/BookingDetailsModal';
import { BookingStatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { bookingStatusOptions, formatNaira } from '@/data/admin-mock-data';
import { getFlightBookings } from '@/services/whitelabel-api';

import type { FlightBooking } from '@/services/whitelabel-api';

type BookingStatus = 'PAID' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';

interface AdminBooking {
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
	passenger_details?: Array<{
		name: string;
		type: 'adult' | 'child' | 'infant';
		dob: string;
		document_number?: string;
	}>;
	price_breakdown?: {
		base_fare: number;
		taxes: number;
		total: number;
	};
}

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : dateStr;
}

function mapBookingStatus(status: string): BookingStatus {
	if (status === 'BOOKED' || status === 'CONFIRMED') return 'PAID';
	if (status === 'CANCELLED') return 'CANCELLED';
	return 'PENDING_PAYMENT';
}

function AdminBookingsContent() {
	const searchParams = useSearchParams();
	const initialSearch = searchParams.get('search') ?? '';

	const [bookings, setBookings] = useState<AdminBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [searchQuery, setSearchQuery] = useState(initialSearch);
	const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
		from: '',
		to: '',
	});
	const [page, setPage] = useState(1);
	const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

	// Fetch bookings from API
	useEffect(() => {
		async function loadBookings() {
			setIsLoading(true);
			try {
				const result = await getFlightBookings();
				if (result.success) {
					const mappedBookings: AdminBooking[] = result.data.map((b: FlightBooking) => {
						// Calculate price breakdown
						const amount = b.payable_amount || b.amount || 0;
						const base_fare = Math.round(amount * 0.87 * 100) / 100;
						const taxes = Math.round((amount - base_fare) * 100) / 100;

						return {
							id: parseInt(b.id) || 0,
							reference: b.reference,
							customer: b.passengers?.[0]?.first_name ? `${b.passengers[0].first_name} ${b.passengers[0].last_name}` : 'Unknown',
							email: b.passengers?.[0]?.email || '',
							amount: amount,
							status: mapBookingStatus(b.status),
							booking_date: b.booking_date || b.created_at || '',
							route: `${b.from} → ${b.to}`,
							airline: b.outbound?.[0]?.airline || '',
							passengers: b.passengers?.length || 1,
							departure_date: b.departureDate || '',
							return_date: b.returnDate || '',
							passenger_details: b.passengers?.map((p) => ({
								name: `${p.first_name} ${p.last_name}`,
								type: (p.passenger_type as 'adult' | 'child' | 'infant') || 'adult',
								dob: p.dob || '',
								document_number: undefined,
							})),
							price_breakdown: {
								base_fare,
								taxes,
								total: amount,
							},
						};
					});
					setBookings(mappedBookings);
				}
			} catch (error) {
				console.error('Failed to load bookings:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadBookings();
	}, []);

	const filteredBookings = useMemo(() => {
		let data = bookings;

		// Status filter
		if (statusFilter !== 'ALL') {
			data = data.filter((booking) => booking.status === statusFilter);
		}

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			data = data.filter((booking) => {
				const matchesReference = booking.reference.toLowerCase().includes(query);
				const matchesCustomer = booking.customer.toLowerCase().includes(query);
				const matchesEmail = booking.email.toLowerCase().includes(query);
				return matchesReference || matchesCustomer || matchesEmail;
			});
		}

		// Date range filter
		if (dateRange.from) {
			data = data.filter((booking) => booking.booking_date >= dateRange.from);
		}
		if (dateRange.to) {
			data = data.filter((booking) => booking.booking_date <= dateRange.to);
		}

		return data;
	}, [bookings, statusFilter, searchQuery, dateRange]);

	const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
	const paginatedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleClearFilters = () => {
		setStatusFilter('ALL');
		setSearchQuery('');
		setDateRange({ from: '', to: '' });
		setPage(1);
	};

	const columns = [
		{
			key: 'reference',
			header: 'Reference',
			render: (booking: AdminBooking) => (
				<button
					type="button"
					onClick={() => setSelectedBooking(booking)}
					className="font-mono text-xs font-medium text-primary hover:underline">
					{booking.reference}
				</button>
			),
		},
		{
			key: 'customer',
			header: 'Customer',
			render: (booking: AdminBooking) => (
				<div>
					<p className="font-medium">{booking.customer}</p>
					<p className="text-xs text-muted-foreground">{booking.email}</p>
				</div>
			),
		},
		{
			key: 'route',
			header: 'Route',
			render: (booking: AdminBooking) => booking.route,
		},
		{
			key: 'amount',
			header: 'Amount',
			render: (booking: AdminBooking) => <span className="font-medium">{formatNaira(booking.amount)}</span>,
		},
		{
			key: 'booking_date',
			header: 'Date',
			render: (booking: AdminBooking) => <span className="text-muted-foreground">{formatDate(booking.booking_date)}</span>,
		},
		{
			key: 'status',
			header: 'Status',
			render: (booking: AdminBooking) => <BookingStatusBadge status={booking.status} />,
		},
		{
			key: 'action',
			header: 'Action',
			render: (booking: AdminBooking) => (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setSelectedBooking(booking)}>
					<Eye className="h-3.5 w-3.5" />
					View Details
				</Button>
			),
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-6">
			<div className="dashboard-page-header">
				<h1 className="dashboard-title">Bookings Management</h1>
				<p className="dashboard-subtitle">View and manage all flight bookings</p>
			</div>

			<AdminFilters
				searchValue={searchQuery}
				onSearchChange={(value) => {
					setSearchQuery(value);
					setPage(1);
				}}
				searchPlaceholder="Search by reference, customer, or email..."
				statusValue={statusFilter}
				onStatusChange={(value) => {
					setStatusFilter(value);
					setPage(1);
				}}
				statusOptions={bookingStatusOptions}
				dateRange={dateRange}
				onDateRangeChange={(range) => {
					setDateRange(range);
					setPage(1);
				}}
				showDateRange
				onClear={handleClearFilters}
			/>

			<AdminTable
				data={paginatedBookings}
				columns={columns}
				isLoading={isLoading}
				emptyMessage="No bookings match your filters"
				getRowKey={(booking) => booking.id}
				skeletonRows={PAGE_SIZE}
			/>

			<AdminPagination
				page={page}
				totalPages={totalPages}
				totalItems={filteredBookings.length}
				pageSize={PAGE_SIZE}
				onPageChange={setPage}
				itemLabel="bookings"
			/>

			<BookingDetailsModal
				booking={selectedBooking}
				open={!!selectedBooking}
				onOpenChange={(open) => !open && setSelectedBooking(null)}
			/>
		</motion.div>
	);
}

export default function AdminBookingsPage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-6">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			}>
			<AdminBookingsContent />
		</Suspense>
	);
}
