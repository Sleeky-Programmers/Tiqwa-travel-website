'use client';

import { format, isValid, parseISO } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle, ChevronRight, Clock, ClockIcon, CreditCard, Filter, MapPin, Plane, Search, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { FlightBooking, formatFlightPrice, getFlightBookings } from '@/services/whitelabel-api';

type TabType = 'upcoming' | 'past' | 'cancelled';

function formatBookingDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'MMM dd, yyyy') : dateStr;
}

function formatBookingTime(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'h:mm a') : dateStr;
}

function getBookingDate(dateStr: string): Date | null {
	if (!dateStr) return null;
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? parsed : null;
}

function getStatusStyles(status: string): { label: string; className: string; icon: React.ReactNode } {
	const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
		confirmed: {
			label: 'Confirmed',
			className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
			icon: <CheckCircle className="h-3 w-3" />,
		},
		booked: {
			label: 'Booked',
			className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
			icon: <CheckCircle className="h-3 w-3" />,
		},
		pending: {
			label: 'Pending',
			className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
			icon: <ClockIcon className="h-3 w-3" />,
		},
		cancelled: {
			label: 'Cancelled',
			className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
			icon: <XCircle className="h-3 w-3" />,
		},
		reserved: {
			label: 'Reserved',
			className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
			icon: <ClockIcon className="h-3 w-3" />,
		},
	};
	return (
		statusMap[status?.toLowerCase()] || {
			label: status || 'Unknown',
			className: 'bg-muted text-muted-foreground border-border',
			icon: null,
		}
	);
}

function getTabIcon(tab: TabType) {
	switch (tab) {
		case 'upcoming':
			return <Plane className="h-4 w-4" />;
		case 'past':
			return <Clock className="h-4 w-4" />;
		case 'cancelled':
			return <XCircle className="h-4 w-4" />;
	}
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

	const filteredBookings = bookings.filter((booking) => {
		const bookingDate = getBookingDate(booking.departureDate);
		const isPast = bookingDate ? bookingDate < new Date() : false;
		if (activeTab === 'upcoming') {
			return !isPast && booking.status !== 'CANCELLED';
		}
		if (activeTab === 'past') {
			return isPast && booking.status !== 'CANCELLED';
		}
		return booking.status === 'CANCELLED';
	});

	const tabs = [
		{ key: 'upcoming' as const, label: 'Upcoming' },
		{ key: 'past' as const, label: 'Past' },
		{ key: 'cancelled' as const, label: 'Cancelled' },
	];

	const tabCounts = tabs.map((tab) => ({
		...tab,
		count: bookings.filter((b) => {
			const bookingDate = getBookingDate(b.departureDate);
			const isPast = bookingDate ? bookingDate < new Date() : false;
			if (tab.key === 'upcoming') return !isPast && b.status !== 'CANCELLED';
			if (tab.key === 'past') return isPast && b.status !== 'CANCELLED';
			return b.status === 'CANCELLED';
		}).length,
	}));

	return (
		<div className="space-y-7 page-transition">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Bookings</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<Calendar className="h-4 w-4" />
						View and manage your flight reservations
					</p>
				</div>
				<Button
					href="/dashboard/search"
					size="default"
					shape="pill"
					className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-105">
					<Search className="mr-2 h-4 w-4" />
					Book New Flight
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			{/* Tabs */}
			<div className="flex flex-wrap gap-1 rounded-2xl bg-white/50 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
				{tabCounts.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={cn(
							'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
							activeTab === tab.key ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
						)}>
						{getTabIcon(tab.key)}
						{tab.label}
						<span className={cn('ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold', activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary')}>
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
						<Plane className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
					</div>
					<p className="mt-4 text-sm text-muted-foreground">Loading your bookings...</p>
				</div>
			) : filteredBookings.length === 0 ? (
				<div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/8">
						<Plane className="h-8 w-8 text-primary/40" />
					</div>
					<p className="text-lg font-semibold">No {activeTab} bookings</p>
					<p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
						{activeTab === 'upcoming'
							? "You don't have any upcoming flights. Start planning your next adventure!"
							: activeTab === 'past'
							? "You haven't completed any flights yet. Your journey starts here!"
							: 'No cancelled bookings found.'}
					</p>
					{activeTab === 'upcoming' && (
						<Button
							href="/dashboard/search"
							shape="pill"
							className="mt-4 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:scale-105">
							<Search className="h-4 w-4" />
							Search for flights
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{filteredBookings.map((booking) => {
						const status = getStatusStyles(booking.status);
						const firstSegment = booking.outbound?.[0];
						const lastSegment = booking.outbound?.[booking.outbound.length - 1];
						const isRoundTrip = booking.inbound && booking.inbound.length > 0;
						const bookingDate = getBookingDate(booking.departureDate);
						const isPast = bookingDate ? bookingDate < new Date() : false;

						return (
							<div
								key={booking.id || booking.reference}
								className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
								{/* Status Bar */}
								<div
									className={cn(
										'absolute top-0 left-0 right-0 h-1',
										status.className.includes('emerald')
											? 'bg-emerald-500'
											: status.className.includes('amber')
											? 'bg-amber-500'
											: status.className.includes('red')
											? 'bg-red-500'
											: 'bg-primary'
									)}
								/>

								<div className="p-5 pt-6">
									<div className="flex flex-wrap items-start justify-between gap-4">
										{/* Route & Flight Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-3">
												{/* Airline Logo */}
												{firstSegment?.airline_logo && (
													<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white/50 p-1.5 dark:bg-white/5">
														<img
															src={firstSegment.airline_logo}
															alt={firstSegment.airline}
															className="h-full w-full object-contain"
														/>
													</div>
												)}
												<div className="min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="text-lg font-bold">{booking.from}</span>
														<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
														<span className="text-lg font-bold">{booking.to}</span>
													</div>
													<div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
														<span className="flex items-center gap-1">
															<Calendar className="h-3.5 w-3.5" />
															{formatBookingDate(booking.departureDate)}
															<span className="text-xs">at {formatBookingTime(booking.departureDate)}</span>
														</span>
														<span className="flex items-center gap-1">
															<Users className="h-3.5 w-3.5" />
															{booking.passengers?.length || 1} {booking.passengers?.length !== 1 ? 'passengers' : 'passenger'}
														</span>
														{booking.stops !== undefined && (
															<span className="text-xs">{booking.stops === 0 ? '🛫 Non-stop' : `${booking.stops} stop${booking.stops > 1 ? 's' : ''}`}</span>
														)}
														{isRoundTrip && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Round trip</span>}
														{firstSegment?.airline && <span className="text-xs">• {firstSegment.airline}</span>}
													</div>
												</div>
											</div>
										</div>

										{/* Price & Status */}
										<div className="flex items-center gap-4 shrink-0">
											<div className="text-right">
												<p className="text-xl font-bold text-primary">{formatFlightPrice(booking.payable_amount || booking.amount, booking.currency)}</p>
												<div className="flex items-center justify-end gap-1.5 mt-1">
													<span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', status.className)}>
														{status.icon}
														{status.label}
													</span>
													{booking.ticket_issued && (
														<span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
															<CheckCircle className="h-2.5 w-2.5" />
															Ticket Issued
														</span>
													)}
												</div>
											</div>
											<Button
												href={`/dashboard/bookings/${booking.reference}`}
												size="sm"
												variant="outline"
												className="hover:bg-primary/10 hover:text-primary">
												View Details
												<ChevronRight className="ml-1 h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>

								{/* Footer: Quick info bar */}
								<div className="border-t border-border/60 bg-primary/5 px-5 py-2.5 dark:bg-primary/5">
									<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
										<span className="flex items-center gap-1.5">
											<CreditCard className="h-3 w-3" />
											<span className="font-mono">Ref: {booking.reference}</span>
										</span>
										<span className="flex items-center gap-1.5">
											{isPast ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-primary" />}
											{isPast ? 'Completed' : 'Upcoming'}
										</span>
										{isRoundTrip && booking.returnDate && (
											<span className="flex items-center gap-1.5">
												<Calendar className="h-3 w-3" />
												Return: {formatBookingDate(booking.returnDate)}
											</span>
										)}
										<span className="font-mono text-[10px] text-muted-foreground/60">ID: {booking.booking_id || booking.id}</span>
									</div>
								</div>

								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
