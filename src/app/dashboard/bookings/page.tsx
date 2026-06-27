'use client';

import { format, isValid, parseISO } from 'date-fns';
import { Calendar, ChevronRight, Clock, CreditCard, MapPin, Plane, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

function getStatusStyles(status: string): { label: string; className: string } {
	const statusMap: Record<string, { label: string; className: string }> = {
		confirmed: { label: 'Confirmed', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
		booked: { label: 'Booked', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
		pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
		cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
		reserved: { label: 'Reserved', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
	};
	return statusMap[status?.toLowerCase()] || { label: status || 'Unknown', className: 'bg-muted text-muted-foreground' };
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

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">My Bookings</h1>
				<p className="text-muted-foreground">View and manage your flight reservations</p>
			</div>

			<div className="flex gap-2 border-b border-border/60">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
							activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
						}`}>
						{tab.label}
					</button>
				))}
			</div>

			{isLoading ? (
				<div className="flex justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : filteredBookings.length === 0 ? (
				<Card
					hover={false}
					className="p-12 text-center">
					<p className="text-muted-foreground">No {activeTab} bookings found</p>
					{activeTab === 'upcoming' && (
						<Link
							href="/dashboard/search"
							className="mt-2 inline-block text-sm text-primary hover:underline">
							Search for flights
						</Link>
					)}
				</Card>
			) : (
				<div className="space-y-4">
					{filteredBookings.map((booking) => {
						const status = getStatusStyles(booking.status);
						const firstSegment = booking.outbound?.[0];
						const lastSegment = booking.outbound?.[booking.outbound.length - 1];
						const isRoundTrip = booking.inbound && booking.inbound.length > 0;

						return (
							<Card
								key={booking.id || booking.reference}
								hover={false}
								className="overflow-hidden p-0 transition-all hover:shadow-md">
								<div className="p-4">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-3">
												{/* Airline Logo */}
												{firstSegment?.airline_logo && (
													<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-white/50">
														<img
															src={firstSegment.airline_logo}
															alt={firstSegment.airline}
															className="h-full w-full object-contain p-1"
														/>
													</div>
												)}
												<div className="min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="font-semibold">{booking.from}</span>
														<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
														<span className="font-semibold">{booking.to}</span>
														<span className="text-xs text-muted-foreground">•</span>
														<span className="text-sm text-muted-foreground">{firstSegment?.cabin_type || 'Economy'}</span>
														{firstSegment?.airline && <span className="text-xs text-muted-foreground">• {firstSegment.airline}</span>}
													</div>
													<div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
														<span className="flex items-center gap-1">
															<Calendar className="h-3.5 w-3.5" />
															{formatBookingDate(booking.departureDate)}
															<span className="text-xs">at {formatBookingTime(booking.departureDate)}</span>
														</span>
														<span className="flex items-center gap-1">
															<Users className="h-3.5 w-3.5" />
															{booking.passengers?.length || 1} passenger{booking.passengers?.length !== 1 ? 's' : ''}
														</span>
														{booking.stops !== undefined && (
															<span className="text-xs">{booking.stops === 0 ? 'Non-stop' : `${booking.stops} stop${booking.stops > 1 ? 's' : ''}`}</span>
														)}
														{isRoundTrip && <span className="text-xs text-primary">Round trip</span>}
													</div>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-4 shrink-0">
											<div className="text-right">
												<p className="text-lg font-bold text-primary">{formatFlightPrice(booking.payable_amount || booking.amount, booking.currency)}</p>
												<span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
												{booking.ticket_issued && (
													<span className="ml-1 inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600">Ticket Issued</span>
												)}
											</div>
											<Link href={`/dashboard/bookings/${booking.reference}`}>
												<Button
													size="sm"
													variant="outline">
													View Details
												</Button>
											</Link>
										</div>
									</div>
								</div>

								{/* Footer: Quick info bar */}
								<div className="border-t border-border/60 bg-primary/90 px-4 py-2">
									<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white">
										<span className="flex items-center gap-1">
											<CreditCard className="h-3 w-3" />
											Ref: {booking.reference}
										</span>
										{booking.departureDate && (
											<span className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{new Date(booking.departureDate) < new Date() ? 'Completed' : 'Upcoming'}
											</span>
										)}
										{isRoundTrip && booking.returnDate && <span>Return: {formatBookingDate(booking.returnDate)}</span>}
										<span className="font-mono text-[10px]">ID: {booking.booking_id || booking.id}</span>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
