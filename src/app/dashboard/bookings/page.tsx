'use client';

import { format, isValid, parseISO } from 'date-fns';
import { ArrowRight, CheckCircle, Clock, Info, Plane, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FlightBooking, formatFlightPrice, getFlightBookings } from '@/services/whitelabel-api';

type TabType = 'upcoming' | 'past' | 'cancelled';

function formatBookingDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : dateStr;
}

function getBookingDate(dateStr: string): Date | null {
	if (!dateStr) return null;
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? parsed : null;
}

function StatusBadge({ status }: { status: string }) {
	const normalized = status?.toLowerCase();
	const styles: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
		confirmed: { label: 'Paid', className: 'dc-badge-success', icon: <CheckCircle className="h-3 w-3" /> },
		booked: { label: 'Paid', className: 'dc-badge-success', icon: <CheckCircle className="h-3 w-3" /> },
		pending: { label: 'Pending', className: 'dc-badge-warning', icon: <Clock className="h-3 w-3" /> },
		reserved: { label: 'Pending', className: 'dc-badge-warning', icon: <Clock className="h-3 w-3" /> },
		cancelled: { label: 'Cancelled', className: 'dc-badge-destructive', icon: <XCircle className="h-3 w-3" /> },
	};
	const style = styles[normalized] ?? { label: status || 'Unknown', className: 'bg-muted text-muted-foreground', icon: null };
	return (
		<span className={cn('dc-badge', style.className)}>
			{style.icon}
			{style.label}
		</span>
	);
}

export default function BookingsPage() {
	const [bookings, setBookings] = useState<FlightBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabType>('upcoming');

	useEffect(() => {
		async function loadBookings() {
			const result = await getFlightBookings();
			if (result.success) {
				setBookings(result.data);
			}
			setIsLoading(false);
		}
		loadBookings();
	}, []);

	const matchesTab = (booking: FlightBooking, tab: TabType) => {
		const bookingDate = getBookingDate(booking.departureDate);
		const isPast = bookingDate ? bookingDate < new Date() : false;
		if (tab === 'upcoming') return !isPast && booking.status !== 'CANCELLED';
		if (tab === 'past') return isPast && booking.status !== 'CANCELLED';
		return booking.status === 'CANCELLED';
	};

	const filteredBookings = bookings.filter((b) => matchesTab(b, activeTab));

	const tabs = [
		{ key: 'upcoming' as const, label: 'Upcoming' },
		{ key: 'past' as const, label: 'Past' },
		{ key: 'cancelled' as const, label: 'Cancelled' },
	];

	const tabCounts = tabs.map((tab) => ({
		...tab,
		count: bookings.filter((b) => matchesTab(b, tab.key)).length,
	}));

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">My Bookings</h1>
				<p className="mt-1 text-xs text-muted-foreground">View and manage your flight reservations</p>
			</div>

			{/* Pill filter tabs */}
			<div className="flex flex-wrap items-center gap-2.5">
				{tabCounts.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={cn(
							'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
							activeTab === tab.key
								? 'bg-primary text-white shadow-sm shadow-primary/25'
								: 'border border-[var(--dc-border)] bg-background-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
						)}>
						{tab.label}
						<span
							className={cn(
								'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
								activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
							)}>
							{tab.count}
						</span>
					</button>
				))}
			</div>

			{/* Results */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-20">
					<div className="relative">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
						<Plane className="absolute inset-0 m-auto h-5 w-5 animate-pulse text-primary" />
					</div>
					<p className="mt-4 text-sm text-muted-foreground">Loading your bookings...</p>
				</div>
			) : filteredBookings.length === 0 ? (
				<div className="dc-card p-12 text-center">
					<p className="font-semibold">No {activeTab} bookings</p>
					<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
						{activeTab === 'upcoming'
							? "You don't have any upcoming flights. Start planning your next adventure!"
							: activeTab === 'past'
								? "You haven't completed any flights yet. Your journey starts here!"
								: 'No cancelled bookings found.'}
					</p>
					{activeTab === 'upcoming' && (
						<Button
							href="/dashboard/search"
							className="mt-5">
							<Search className="h-4 w-4" />
							Search for flights
						</Button>
					)}
				</div>
			) : (
				<div className="dc-card overflow-hidden">
					<div className="overflow-x-auto">
						<table className="dc-table">
							<thead>
								<tr>
									<th>Booking ID</th>
									<th>Departure</th>
									<th>Destination</th>
									<th>Passengers</th>
									<th>Date</th>
									<th>Price</th>
									<th>Status</th>
									<th aria-label="Actions" />
								</tr>
							</thead>
							<tbody>
								{filteredBookings.map((booking) => {
									const firstSegment = booking.outbound?.[0];
									return (
										<tr key={booking.id || booking.reference}>
											<td className="font-mono text-xs font-medium">{booking.reference}</td>
											<td>
												<span className="font-medium">{booking.fromCode || booking.from}</span>
											</td>
											<td>
												<span className="font-medium">{booking.toCode || booking.to}</span>
											</td>
											<td className="text-muted-foreground">
												{booking.passengers?.length || 1} {booking.passengers?.length === 1 ? 'Adult, 0 Child' : 'Adults'}
											</td>
											<td className="text-muted-foreground">{formatBookingDate(booking.departureDate)}</td>
											<td className="font-semibold">{formatFlightPrice(booking.payable_amount || booking.amount, booking.currency)}</td>
											<td>
												<StatusBadge status={booking.status} />
											</td>
											<td className="text-right">
												<Button
													href={`/dashboard/bookings/${booking.reference}`}
													variant="ghost"
													size="sm"
													className="rounded-lg hover:bg-primary/10 hover:text-primary">
													Details
													<ArrowRight className="ml-1 h-3.5 w-3.5" />
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Support banner (mockup: green info strip) */}
			<div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
				<Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
				<p className="text-xs text-emerald-800 dark:text-emerald-300">
					Need assistance with an existing booking or need to make changes? Contact our 24/7 Premium Support.
				</p>
			</div>
		</div>
	);
}
