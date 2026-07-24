'use client';

import { ArrowLeft, Building, Calendar, CheckCircle, Clock, ClockIcon, CreditCard, FileText, Loader2, Mail, MapPin, Phone, Plane, User, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Link as UiLink } from '@/components/ui/Link';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { formatFlightPrice, getBookingDetails } from '@/services/whitelabel-api';
import { BookingDetails } from '@/types/whitelabel';

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

function formatTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
}

function getStatusColor(status: string): { bg: string; text: string; border: string; icon: React.ReactNode } {
	const statusMap: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
		BOOKED: {
			bg: 'bg-emerald-500/10',
			text: 'text-emerald-600 dark:text-emerald-400',
			border: 'border-emerald-500/20',
			icon: <CheckCircle className="h-3.5 w-3.5" />,
		},
		CONFIRMED: {
			bg: 'bg-emerald-500/10',
			text: 'text-emerald-600 dark:text-emerald-400',
			border: 'border-emerald-500/20',
			icon: <CheckCircle className="h-3.5 w-3.5" />,
		},
		PENDING: {
			bg: 'bg-amber-500/10',
			text: 'text-amber-600 dark:text-amber-400',
			border: 'border-amber-500/20',
			icon: <ClockIcon className="h-3.5 w-3.5" />,
		},
		PENDING_PAYMENT: {
			bg: 'bg-amber-500/10',
			text: 'text-amber-600 dark:text-amber-400',
			border: 'border-amber-500/20',
			icon: <ClockIcon className="h-3.5 w-3.5" />,
		},
		CANCELLED: {
			bg: 'bg-red-500/10',
			text: 'text-red-600 dark:text-red-400',
			border: 'border-red-500/20',
			icon: <XCircle className="h-3.5 w-3.5" />,
		},
		RESERVED: {
			bg: 'bg-blue-500/10',
			text: 'text-blue-600 dark:text-blue-400',
			border: 'border-blue-500/20',
			icon: <ClockIcon className="h-3.5 w-3.5" />,
		},
	};
	return (
		statusMap[status] || {
			bg: 'bg-muted',
			text: 'text-muted-foreground',
			border: 'border-border',
			icon: null,
		}
	);
}

function getDisplayStatus(status: string): string {
	if (status === 'PENDING' || status === 'PENDING_PAYMENT') {
		return 'Pending';
	}
	return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
}

function getDepartureDate(booking: BookingDetails): string | null {
	return booking.outbound?.[0]?.departure_time || null;
}

function isBookingPast(booking: BookingDetails): boolean {
	const departureTime = getDepartureDate(booking);
	if (!departureTime) return false;
	return new Date(departureTime) < new Date();
}

function getArrivalDate(booking: BookingDetails): string | null {
	const outbound = booking.outbound;
	if (!outbound || outbound.length === 0) return null;
	const lastSegment = outbound[outbound.length - 1];
	return lastSegment?.arrival_time || null;
}

function BookingDetailsContent() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [booking, setBooking] = useState<BookingDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchBooking() {
			try {
				const result = await getBookingDetails(id);
				if (result.success) {
					setBooking(result.data);
				} else {
					setError(result.error || 'Booking not found');
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load booking');
			} finally {
				setIsLoading(false);
			}
		}

		if (id) {
			fetchBooking();
		}
	}, [id]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="relative">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
					<Plane className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
				</div>
				<p className="mt-4 text-sm text-muted-foreground">Loading booking details...</p>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<XCircle className="h-8 w-8 text-destructive" />
					</div>
					<p className="text-lg font-semibold">Booking Not Found</p>
					<p className="mt-2 text-sm text-muted-foreground max-w-md">{error || "The booking you're looking for doesn't exist or has been removed."}</p>
					<Button href="/dashboard/bookings" shape="pill" className="mt-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Bookings
					</Button>
				</div>
			</div>
		);
	}

	const firstSegment = booking.outbound?.[0];
	const lastSegment = booking.outbound?.[booking.outbound.length - 1];
	const status = getStatusColor(booking.status);
	const isPast = isBookingPast(booking);
	const departureDate = getDepartureDate(booking);
	const arrivalDate = getArrivalDate(booking);

	return (
		<div className="space-y-7 page-transition">
			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<UiLink href="/dashboard/bookings" variant="back">
						Back to Bookings
					</UiLink>
					<h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Booking Details</h1>
					<div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<FileText className="h-4 w-4" />
							Reference: <span className="font-mono font-medium text-foreground">{booking.reference}</span>
						</span>
						{booking.pnr && (
							<span className="flex items-center gap-1.5">
								<Building className="h-4 w-4" />
								PNR: <span className="font-mono">{booking.pnr}</span>
							</span>
						)}
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium', status.bg, status.text, status.border)}>
						{status.icon}
						{getDisplayStatus(booking.status)}
					</span>
					{isPast ? (
						<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
							<CheckCircle className="h-3.5 w-3.5" />
							Completed
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary border border-primary/20">
							<ClockIcon className="h-3.5 w-3.5" />
							Upcoming
						</span>
					)}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Flight Summary Card */}
					<div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
						<div className="flex items-start gap-4">
							{/* Airline Logo */}
							{firstSegment?.airline_details?.logo && (
								<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white/50 p-1.5 dark:bg-white/5">
									<img
										src={firstSegment.airline_details.logo}
										alt={firstSegment.airline_details.name}
										className="h-full w-full object-contain"
									/>
								</div>
							)}
							<div className="flex-1">
								<p className="font-semibold text-lg">{firstSegment?.airline_details?.name || 'Unknown Airline'}</p>
								<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
									<span className="font-mono">{firstSegment?.flight_number}</span>
									<span className="text-muted-foreground/40">•</span>
									<span>{firstSegment?.cabin_type || 'Economy'}</span>
									{booking.query_type && (
										<>
											<span className="text-muted-foreground/40">•</span>
											<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
												{booking.query_type === 'one_way' ? 'One Way' : 'Round Trip'}
											</span>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Route */}
						<div className="mt-6 grid gap-4 sm:grid-cols-3">
							<div>
								<p className="text-sm text-muted-foreground">From</p>
								<p className="text-xl font-bold">{firstSegment?.airport_from_details?.city}</p>
								<p className="text-sm text-muted-foreground">{firstSegment?.airport_from_details?.iata_code}</p>
								{departureDate && (
									<>
										<div className="mt-2 flex items-center gap-2 text-sm">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span>{formatDate(departureDate)}</span>
										</div>
										<p className="text-sm font-medium text-primary">{formatTime(departureDate)}</p>
									</>
								)}
							</div>

							<div className="flex flex-col items-center justify-center">
								<div className="flex items-center gap-2 w-full">
									<div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
									<Plane className="h-5 w-5 rotate-90 text-primary" />
									<div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
								</div>
								<p className="mt-2 text-sm text-muted-foreground">
									{Math.floor(booking.total_duration / 60)}h {booking.total_duration % 60}m
								</p>
								{booking.outbound && booking.outbound.length > 1 && (
									<p className="text-xs text-muted-foreground">
										{booking.outbound.length - 1} stop{booking.outbound.length - 1 > 1 ? 's' : ''}
									</p>
								)}
							</div>

							<div className="text-right">
								<p className="text-sm text-muted-foreground">To</p>
								<p className="text-xl font-bold">{lastSegment?.airport_to_details?.city}</p>
								<p className="text-sm text-muted-foreground">{lastSegment?.airport_to_details?.iata_code}</p>
								{arrivalDate && (
									<>
										<div className="mt-2 flex items-center justify-end gap-2 text-sm">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span>{formatDate(arrivalDate)}</span>
										</div>
										<p className="text-sm font-medium text-primary">{formatTime(arrivalDate)}</p>
									</>
								)}
							</div>
						</div>

						{/* Flight Segments */}
						{booking.outbound && booking.outbound.length > 1 && (
							<div className="mt-6 border-t border-border/60 pt-4">
								<p className="text-sm font-medium mb-3">Flight Segments</p>
								<div className="space-y-2">
									{booking.outbound.map((segment, index) => (
										<div
											key={index}
											className="flex flex-wrap items-center gap-3 rounded-lg bg-primary/5 px-3 py-2 text-sm dark:bg-primary/5">
											<span className="font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">{segment.flight_number}</span>
											<span className="font-medium">{segment.airport_from_details?.city}</span>
											<span className="text-muted-foreground">→</span>
											<span className="font-medium">{segment.airport_to_details?.city}</span>
											<span className="text-muted-foreground text-xs">
												{formatTime(segment.departure_time)} - {formatTime(segment.arrival_time)}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Passenger Details */}
					<div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<User className="h-5 w-5 text-primary" />
							Passenger Details
						</h3>
						<div className="mt-4 space-y-3">
							{booking.passengers &&
								booking.passengers.map((passenger, index) => (
									<div
										key={index}
										className="rounded-xl border border-border/60 p-4 transition-colors hover:bg-primary/5 dark:hover:bg-primary/5">
										<div className="flex flex-wrap items-start justify-between gap-2">
											<div>
												<p className="font-semibold">
													{passenger.title?.toUpperCase()} {passenger.first_name} {passenger.middle_name || ''} {passenger.last_name}
												</p>
												<div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<User className="h-3.5 w-3.5" />
														{passenger.passenger_type}
													</span>
													{passenger.dob && (
														<span className="flex items-center gap-1">
															<Calendar className="h-3.5 w-3.5" />
															{formatDate(passenger.dob)}
														</span>
													)}
													{passenger.gender && <span>{passenger.gender}</span>}
												</div>
											</div>
											{passenger.documents && (
												<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
													{passenger.documents.document_type?.toUpperCase() || 'No document'}
												</span>
											)}
										</div>
										<div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
											{passenger.email && (
												<p className="flex items-center gap-2">
													<Mail className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground">Email:</span>
													<span>{passenger.email}</span>
												</p>
											)}
											{passenger.phone_number && (
												<p className="flex items-center gap-2">
													<Phone className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground">Phone:</span>
													<span>{passenger.phone_number}</span>
												</p>
											)}
											{passenger.documents && (
												<>
													<p className="flex items-center gap-2">
														<FileText className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">Document:</span>
														<span className="font-mono">{passenger.documents.number}</span>
													</p>
													{passenger.documents.expiry_date && (
														<p className="flex items-center gap-2">
															<Calendar className="h-4 w-4 text-muted-foreground" />
															<span className="text-muted-foreground">Expiry:</span>
															<span>{formatDate(passenger.documents.expiry_date)}</span>
														</p>
													)}
												</>
											)}
										</div>
									</div>
								))}
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Price Summary */}
					<div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none sticky top-24">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<CreditCard className="h-5 w-5 text-primary" />
							Price Summary
						</h3>
						<div className="mt-4 space-y-2 text-sm">
							{booking.pricing?.base_fare !== null && booking.pricing?.base_fare !== undefined && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Base Fare</span>
									<span className="font-medium">{formatFlightPrice(booking.pricing.base_fare || 0, booking.currency)}</span>
								</div>
							)}
							{booking.pricing?.tax !== null && booking.pricing?.tax !== undefined && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Taxes & Fees</span>
									<span className="font-medium">{formatFlightPrice(booking.pricing.tax || 0, booking.currency)}</span>
								</div>
							)}
							{booking.pricing?.markup && booking.pricing.markup.length > 0 && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Markup</span>
									<span className="font-medium">
										{formatFlightPrice(
											booking.pricing.markup.reduce((sum: number, m: any) => sum + (m.price || 0), 0),
											booking.currency
										)}
									</span>
								</div>
							)}
							<div className="border-t border-border/60 pt-3 mt-3">
								<div className="flex justify-between text-base font-bold">
									<span>Total Paid</span>
									<span className="text-primary">{formatFlightPrice(Number(booking.payable_amount || booking.amount), booking.currency)}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Booking Info */}
					<div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
						<h3 className="text-sm font-semibold flex items-center gap-2">
							<FileText className="h-4 w-4 text-primary" />
							Booking Information
						</h3>
						<div className="mt-3 space-y-2 text-sm">
							{booking.booking_id && (
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Booking ID</span>
									<span className="font-mono text-foreground">{booking.booking_id}</span>
								</div>
							)}
							<div className="flex justify-between py-1 border-t border-border/40">
								<span className="text-muted-foreground">Reference</span>
								<span className="font-mono text-foreground">{booking.reference}</span>
							</div>
							{booking.created_at && (
								<div className="flex justify-between py-1 border-t border-border/40">
									<span className="text-muted-foreground">Created</span>
									<span className="text-foreground">{formatDate(booking.created_at)}</span>
								</div>
							)}
							{booking.expires_at && (
								<div className="flex justify-between py-1 border-t border-border/40">
									<span className="text-muted-foreground">Expires</span>
									<span className="text-amber-600 dark:text-amber-400 font-medium">{formatDate(booking.expires_at)}</span>
								</div>
							)}
							{booking.passengers && (
								<div className="flex justify-between py-1 border-t border-border/40">
									<span className="text-muted-foreground">Passengers</span>
									<span className="text-foreground font-medium">{booking.passengers.length}</span>
								</div>
							)}
							{booking.bookable_seats && (
								<div className="flex justify-between py-1 border-t border-border/40">
									<span className="text-muted-foreground">Bookable Seats</span>
									<span className="text-foreground font-medium">{booking.bookable_seats}</span>
								</div>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2">
						<Button href="/dashboard/bookings" variant="outline" className="w-full hover:bg-primary/10 hover:text-primary">
							<ArrowLeft className="mr-2 h-4 w-4" />
							View All Bookings
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function BookingDetailsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center py-20">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<p className="mt-4 text-sm text-muted-foreground">Loading booking details...</p>
				</div>
			}>
			<BookingDetailsContent />
		</Suspense>
	);
}
