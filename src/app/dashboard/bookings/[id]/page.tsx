'use client';

import { ArrowLeft, Loader2, Plane } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

function getStatusColor(status: string): string {
	const statusMap: Record<string, string> = {
		BOOKED: 'bg-green-500/10 text-green-600 dark:text-green-400',
		CONFIRMED: 'bg-green-500/10 text-green-600 dark:text-green-400',
		PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		PENDING_PAYMENT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400',
		RESERVED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	};
	return statusMap[status] || 'bg-muted text-muted-foreground';
}

function getDisplayStatus(status: string): string {
	if (status === 'PENDING' || status === 'PENDING_PAYMENT') {
		return 'Pending';
	}
	// Capitalize first letter and replace underscore with space for other statuses
	return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
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
			<div className="flex h-[60vh] items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="mt-4 text-muted-foreground">Loading booking details...</p>
				</div>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-medium text-destructive">Booking Not Found</p>
					<p className="mt-2 text-muted-foreground">{error || "The booking you're looking for doesn't exist."}</p>
					<Link href="/dashboard/bookings">
						<Button className="mt-4">Back to Bookings</Button>
					</Link>
				</div>
			</div>
		);
	}

	const firstSegment = booking.outbound?.[0];
	const lastSegment = booking.outbound?.[booking.outbound.length - 1];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<Link
						href="/dashboard/bookings"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
						<ArrowLeft className="h-4 w-4" />
						Back to Bookings
					</Link>
					<h1 className="mt-2 text-2xl font-bold">Booking Details</h1>
					<p className="text-sm text-muted-foreground">
						Reference: <span className="font-mono font-medium">{booking.reference}</span>
					</p>
				</div>
				<div className="flex items-center gap-3">
					<span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>{getDisplayStatus(booking.status)}</span>
					<span className="text-sm text-muted-foreground">
						PNR: <span className="font-mono">{booking.pnr}</span>
					</span>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Flight Summary Card */}
					<Card
						hover={false}
						className="p-6">
						<div className="flex items-start gap-4">
							{/* Airline Logo */}
							{firstSegment?.airline_details?.logo && (
								<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-white/50">
									<img
										src={firstSegment.airline_details.logo}
										alt={firstSegment.airline_details.name}
										className="h-full w-full object-contain p-1.5"
									/>
								</div>
							)}
							<div className="flex-1">
								<p className="font-semibold">{firstSegment?.airline_details?.name || 'Unknown Airline'}</p>
								<p className="text-sm text-muted-foreground">
									{firstSegment?.flight_number} • {firstSegment?.cabin_type || 'Economy'}
								</p>
							</div>
						</div>

						{/* Route */}
						<div className="mt-6 grid gap-4 sm:grid-cols-3">
							<div>
								<p className="text-sm text-muted-foreground">From</p>
								<p className="font-semibold">{firstSegment?.airport_from_details?.city}</p>
								<p className="text-xs text-muted-foreground">
									{firstSegment?.airport_from_details?.iata_code} • {formatDate(firstSegment?.departure_time || '')}
								</p>
								<p className="text-xs font-medium">{formatTime(firstSegment?.departure_time || '')}</p>
							</div>

							<div className="flex flex-col items-center justify-center">
								<div className="flex items-center gap-2">
									<div className="h-px w-8 bg-border" />
									<Plane className="h-4 w-4 rotate-90 text-primary" />
									<div className="h-px w-8 bg-border" />
								</div>
								<p className="text-xs text-muted-foreground">
									{Math.floor(booking.total_duration / 60)}h {booking.total_duration % 60}m
								</p>
								{booking.outbound?.length > 1 && <p className="text-xs text-muted-foreground">{booking.outbound.length - 1} stop(s)</p>}
							</div>

							<div className="text-right">
								<p className="text-sm text-muted-foreground">To</p>
								<p className="font-semibold">{lastSegment?.airport_to_details?.city}</p>
								<p className="text-xs text-muted-foreground">
									{lastSegment?.airport_to_details?.iata_code} • {formatDate(lastSegment?.arrival_time || '')}
								</p>
								<p className="text-xs font-medium">{formatTime(lastSegment?.arrival_time || '')}</p>
							</div>
						</div>

						{/* Flight Segments (if multiple) */}
						{booking.outbound?.length > 1 && (
							<div className="mt-4 border-t border-border pt-4">
								<p className="text-sm font-medium mb-2">Flight Segments</p>
								{booking.outbound.map((segment, index) => (
									<div
										key={index}
										className="flex items-center gap-4 text-sm">
										<span className="font-mono text-xs">{segment.flight_number}</span>
										<span>{segment.airport_from_details?.city}</span>
										<span className="text-muted-foreground">→</span>
										<span>{segment.airport_to_details?.city}</span>
										<span className="text-muted-foreground">
											{formatTime(segment.departure_time)} - {formatTime(segment.arrival_time)}
										</span>
									</div>
								))}
							</div>
						)}
					</Card>

					{/* Passenger Details */}
					<Card
						hover={false}
						className="p-6">
						<h3 className="text-lg font-semibold">Passenger Details</h3>
						<div className="mt-4 space-y-4">
							{booking.passengers.map((passenger, index) => (
								<div
									key={index}
									className="rounded-lg border border-border p-4">
									<div className="flex flex-wrap items-start justify-between gap-2">
										<div>
											<p className="font-medium">
												{passenger.title.toUpperCase()} {passenger.first_name} {passenger.middle_name} {passenger.last_name}
											</p>
											<p className="text-sm text-muted-foreground">
												{passenger.passenger_type} • {formatDate(passenger.dob)} • {passenger.gender}
											</p>
										</div>
										<span className="rounded bg-primary/90 px-2 py-0.5 text-xs text-white">{passenger.documents?.document_type.toUpperCase() || 'No document'}</span>
									</div>
									<div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
										<p>
											<span className="text-muted-foreground">Email:</span> {passenger.email}
										</p>
										<p>
											<span className="text-muted-foreground">Phone:</span> {passenger.phone_number}
										</p>
										{passenger.documents && (
											<>
												<p>
													<span className="text-muted-foreground">Document:</span> {passenger.documents.number}
												</p>
												<p>
													<span className="text-muted-foreground">Expiry:</span> {formatDate(passenger.documents.expiry_date)}
												</p>
											</>
										)}
									</div>
								</div>
							))}
						</div>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Price Summary */}
					<Card
						hover={false}
						className="p-6 sticky top-24">
						<h3 className="text-lg font-semibold">Price Summary</h3>
						<div className="mt-4 space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Base Fare</span>
								<span>{formatFlightPrice(booking.pricing?.base_fare || 0, booking.currency)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Taxes & Fees</span>
								<span>{formatFlightPrice(booking.pricing?.tax || 0, booking.currency)}</span>
							</div>
							{booking.pricing?.markup && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Markup</span>
									<span>{formatFlightPrice(booking.pricing.markup, booking.currency)}</span>
								</div>
							)}
							<div className="border-t border-border pt-2">
								<div className="flex justify-between font-semibold">
									<span>Total Paid</span>
									<span className="text-primary">{formatFlightPrice(Number(booking.payable_amount || booking.amount), booking.currency)}</span>
								</div>
							</div>
						</div>
					</Card>

					{/* Booking Info */}
					<Card
						hover={false}
						className="p-6">
						<h3 className="text-sm font-semibold">Booking Information</h3>
						<div className="mt-3 space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Booking ID</span>
								<span className="font-mono">{booking.booking_id}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Reference</span>
								<span className="font-mono">{booking.reference}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Created</span>
								<span>{formatDate(booking.created_at)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Expires</span>
								<span className="text-amber-600">{formatDate(booking.expires_at)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Passengers</span>
								<span>{booking.passengers?.length || 1}</span>
							</div>
						</div>
					</Card>

					{/* Actions */}
					<div className="flex flex-col gap-2">
						{/* <Link href={`/dashboard/bookings/${booking.booking_id}/ticket`}>
							<Button
								variant="outline"
								className="w-full">
								Download Ticket
							</Button>
						</Link> */}
						<Link href="/dashboard/bookings">
							<Button
								variant="outline"
								className="w-full">
								View All Bookings
							</Button>
						</Link>
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
				<div className="flex items-center justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			}>
			<BookingDetailsContent />
		</Suspense>
	);
}
