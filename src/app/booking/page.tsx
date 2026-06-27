'use client';

import { ArrowLeft, Clock, CreditCard, Loader2, Plane } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { PassengerData, PassengerForm } from '@/components/form/PassengerForm';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import {
	confirmFlightPrice,
	formatFlightPrice,
	getFlightFromCache,
	initiateBookingFlow,
	isBookingReservationExpired,
	readActiveBooking,
	readCachedFlightSearch,
} from '@/services/whitelabel-api';
import { getFlightStops } from '@/types/flight';

import type { BookingPassengerPayload } from '@/types/whitelabel';

function formatPhoneNumber(value: string): string {
	let cleaned = value.replace(/[^\d+]/g, '');
	if (!cleaned) return '';

	if (cleaned.startsWith('+234')) {
		const nationalNumber = cleaned.slice(4);
		if (nationalNumber.length <= 3) return `+234 ${nationalNumber}`;
		if (nationalNumber.length <= 6) {
			return `+234 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3)}`;
		}
		if (nationalNumber.length <= 10) {
			return `+234 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
		}
		return `+234 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 10)}`;
	}

	if (cleaned.startsWith('0') && cleaned.length <= 11) {
		if (cleaned.length <= 4) return cleaned;
		if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
		return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
	}

	const digits = cleaned.replace(/\D/g, '');
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
	if (digits.length <= 10) {
		return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
	}
	return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)} ${digits.slice(10, 14)}`;
}

function normalizePhone(value: string): string {
	return value.replace(/[^\d+]/g, '');
}

function validatePassenger(data: PassengerData): string | null {
	if (!data.firstName.trim()) return 'First name is required.';
	if (!data.lastName.trim()) return 'Last name is required.';
	if (!data.title) return 'Title is required.';
	if (!data.gender) return 'Gender is required.';
	if (!data.email.trim()) return 'Email is required.';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
		return 'Please enter a valid email address.';
	}
	if (!data.phone.trim()) return 'Phone number is required.';
	if (normalizePhone(data.phone).length < 10) {
		return 'Please enter a valid phone number.';
	}
	if (!data.dateOfBirth) return 'Date of birth is required.';
	if (data.dateOfBirth >= new Date().toISOString().split('T')[0]) {
		return 'Date of birth must be in the past.';
	}
	if (!data.documentNumber.trim()) return 'Document number is required.';
	if (!data.documentExpiryDate) return 'Document expiry date is required.';
	if (!data.issuingCountry.trim()) return 'Issuing country is required.';
	if (!data.nationalityCountry.trim()) return 'Nationality country is required.';
	if (!data.documentType) return 'Document type is required.';
	return null;
}

function buildResultsHref(flight: NonNullable<ReturnType<typeof getFlightFromCache>>, departure: string, passengers: number): string {
	const cached = readCachedFlightSearch();
	if (cached) {
		const { params } = cached;
		const urlParams = new URLSearchParams({
			from: params.from,
			to: params.to,
			departure: params.departure,
			adults: String(params.adults),
			children: String(params.children),
			infants: String(params.infants),
			passengers: String(passengers),
			cabin: params.cabin,
			tripType: params.tripType,
		});
		if (params.returnDate) urlParams.set('returnDate', params.returnDate);
		return `/results?${urlParams.toString()}`;
	}

	return `/results?from=${encodeURIComponent(flight.from)}&to=${encodeURIComponent(flight.to)}&departure=${departure}&passengers=${passengers}`;
}

function BookingContent() {
	const searchParams = useSearchParams();
	const flightId = searchParams.get('flightId') ?? '';
	const passengersCount = Number(searchParams.get('passengers') ?? '1');
	const departure = searchParams.get('departure') ?? '';
	const flight = getFlightFromCache(flightId);

	const getInitialPassenger = (): PassengerData => ({
		firstName: '',
		middleName: '',
		lastName: '',
		title: '',
		gender: '',
		dateOfBirth: '',
		email: '',
		phone: '',
		documentNumber: '',
		documentExpiryDate: '',
		issuingCountry: '',
		nationalityCountry: '',
		documentType: '',
		documentIssueDate: '',
	});

	const [passengers, setPassengers] = useState<PassengerData[]>(() => Array.from({ length: Math.max(1, passengersCount) }, () => getInitialPassenger()));
	const [confirmedPrice, setConfirmedPrice] = useState<number | null>(null);
	const [isConfirmingPrice, setIsConfirmingPrice] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [reservationWarning, setReservationWarning] = useState<string | null>(null);
	const [imageError, setImageError] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(false);
	const [bookingReference, setBookingReference] = useState<string | null>(null);

	const unitPrice = confirmedPrice ?? flight?.price ?? 0;
	const currency = flight?.currency ?? 'NGN';
	const total = unitPrice * passengersCount;

	const resultsHref = useMemo(() => (flight ? buildResultsHref(flight, departure, passengersCount) : '/search'), [flight, departure, passengersCount]);

	const confirmPrice = useCallback(async () => {
		if (!flightId) {
			setIsConfirmingPrice(false);
			return;
		}

		setIsConfirmingPrice(true);
		const result = await confirmFlightPrice(flightId);
		if (result.success && result.data.amount != null) {
			setConfirmedPrice(result.data.amount);
		}
		setIsConfirmingPrice(false);
	}, [flightId]);

	useEffect(() => {
		confirmPrice();
	}, [confirmPrice]);

	useEffect(() => {
		const active = readActiveBooking();
		if (active && active.flightId === flightId && isBookingReservationExpired(active.createdAt)) {
			setReservationWarning('Your previous booking hold may have expired. Submit again to create a new reservation.');
		}
	}, [flightId]);

	const handlePassengerChange = (index: number, data: PassengerData) => {
		const updated = [...passengers];
		updated[index] = data;
		setPassengers(updated);
	};

	const handlePhoneChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const updated = [...passengers];
		updated[index].phone = formatPhoneNumber(e.target.value);
		setPassengers(updated);
	};

	const validateAllPassengers = (): string | null => {
		for (let i = 0; i < passengers.length; i++) {
			const error = validatePassenger(passengers[i]);
			if (error) {
				return `Passenger ${i + 1}: ${error}`;
			}
		}
		return null;
	};

	const handleSubmit = async () => {
		if (!flight) return;

		const validationError = validateAllPassengers();
		if (validationError) {
			setError(validationError);
			return;
		}

		setError(null);
		setIsProcessing(true);

		const passengerPayloads: BookingPassengerPayload[] = passengers.map((p) => ({
			passenger_type: 'adult',
			first_name: p.firstName.trim(),
			last_name: p.lastName.trim(),
			middle_name: p.middleName.trim() || null,
			dob: p.dateOfBirth,
			gender: p.gender,
			title: p.title,
			email: p.email.trim(),
			phone_number: normalizePhone(p.phone),
			documents: {
				number: p.documentNumber.trim(),
				expiry_date: p.documentExpiryDate,
				issuing_date: p.documentIssueDate,
				issuing_country: p.issuingCountry.trim().toUpperCase(),
				nationality_country: p.nationalityCountry.trim().toUpperCase(),
				document_type: p.documentType,
				holder: true,
			},
		}));

		// Use the new initiateBookingFlow function
		const result = await initiateBookingFlow(flightId, passengerPayloads, currency);

		if (!result.success) {
			setError(result.error);
			setIsProcessing(false);
			return;
		}

		setBookingReference(result.reference);
		setBookingSuccess(true);
		window.location.href = result.paymentUrl;
	};

	// Show success state while redirecting
	if (bookingSuccess) {
		return (
			<PublicLayout>
				<Container>
					<div className="glossy-card p-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
							<div className="h-8 w-8 animate-pulse rounded-full bg-green-500" />
						</div>
						<h2 className="text-2xl font-bold">Redirecting to Payment...</h2>
						<p className="mt-2 text-muted-foreground">
							Booking reference: <span className="font-mono font-medium">{bookingReference}</span>
						</p>
						<p className="mt-2 text-sm text-muted-foreground">You will be redirected to Paystack to complete your payment.</p>
						<Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin text-primary" />
					</div>
				</Container>
			</PublicLayout>
		);
	}

	if (!flight) {
		return (
			<PublicLayout>
				<Container className="flex min-h-[70vh] items-center justify-center py-28">
					<div className="text-center">
						<p className="text-lg font-medium">Flight not found</p>
						<p className="mt-2 text-sm text-muted-foreground">Please select a flight from the search results.</p>
						<Link
							href="/search"
							className="mt-4 inline-block text-primary hover:underline">
							Search for flights
						</Link>
					</div>
				</Container>
			</PublicLayout>
		);
	}

	return (
		<PublicLayout>
			<div className="page-fade-in py-28">
				<Container size="md">
					<Link
						href={resultsHref}
						className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
						<ArrowLeft className="h-4 w-4" />
						Back to results
					</Link>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}>
						<h1 className="text-2xl font-bold sm:text-3xl">Complete Your Booking</h1>
						<p className="mt-2 text-sm text-muted-foreground">Enter passenger details to proceed to secure payment via Paystack.</p>

						{error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

						{reservationWarning && (
							<p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
								<Clock className="mt-0.5 h-4 w-4 shrink-0" />
								{reservationWarning}
							</p>
						)}

						<div className="mt-8 grid gap-8 lg:grid-cols-3">
							<div className="space-y-6 lg:col-span-2">
								{passengers.map((passenger, index) => (
									<Card
										key={index}
										hover={false}>
										<PassengerForm
											data={passenger}
											onChange={(data) => handlePassengerChange(index, data)}
											onPhoneChange={handlePhoneChange(index)}
											passengerNumber={index + 1}
											totalPassengers={passengers.length}
											showRemove={passengers.length > 1}
											onRemove={() => {
												const updated = passengers.filter((_, i) => i !== index);
												setPassengers(updated);
											}}
										/>
									</Card>
								))}

								<Card hover={false}>
									<div className="flex items-start gap-3">
										<CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
										<div>
											<h3 className="text-lg font-semibold">Secure Payment</h3>
											<p className="mt-1 text-sm text-muted-foreground">
												After confirming your details, you&apos;ll be redirected to Paystack to complete payment. No card details are collected on this site.
											</p>
										</div>
									</div>
								</Card>
							</div>

							<div>
								<Card
									hover={false}
									className="sticky top-24">
									<div className="flex items-center gap-3">
										<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-white/50">
											{flight.airlineLogo && !imageError ? (
												<Image
													src={flight.airlineLogo}
													alt={`${flight.airline} logo`}
													fill
													className="object-contain p-1.5"
													onError={() => setImageError(true)}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/10 text-primary">
													<Plane className="h-5 w-5" />
												</div>
											)}
										</div>
										<div>
											<p className="font-semibold">{flight.airline}</p>
											<p className="text-sm text-muted-foreground">
												{flight.from} → {flight.to}
											</p>
										</div>
									</div>

									<div className="mt-4 space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Departure</span>
											<span>{flight.departure}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Arrival</span>
											<span>{flight.arrival}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Duration</span>
											<span>{flight.duration}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Stops</span>
											<span>{getFlightStops(flight) === 0 ? 'Non-stop' : getFlightStops(flight)}</span>
										</div>
										{departure && (
											<div className="flex justify-between">
												<span className="text-muted-foreground">Date</span>
												<span>{departure}</span>
											</div>
										)}
										<div className="flex justify-between">
											<span className="text-muted-foreground">Passengers</span>
											<span>{passengers.length}</span>
										</div>
									</div>

									<div className="mt-4 border-t border-border pt-4">
										{isConfirmingPrice ? (
											<p className="flex items-center gap-2 text-sm text-muted-foreground">
												<Loader2 className="h-4 w-4 animate-spin" />
												Confirming latest price...
											</p>
										) : (
											<>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														{formatFlightPrice(unitPrice, currency)} × {passengers.length}
													</span>
													<span>{formatFlightPrice(total, currency)}</span>
												</div>
												<div className="mt-2 flex justify-between text-lg font-bold">
													<span>Total</span>
													<span className="text-primary">{formatFlightPrice(total, currency)}</span>
												</div>
											</>
										)}
									</div>

									<Button
										className="mt-6 w-full"
										size="lg"
										disabled={isProcessing || isConfirmingPrice}
										onClick={handleSubmit}>
										{isProcessing ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Processing booking...
											</>
										) : (
											'Proceed to Payment'
										)}
									</Button>

									<p className="mt-3 text-center text-xs text-muted-foreground">Reservation held for 15 minutes after booking</p>
								</Card>
							</div>
						</div>
					</motion.div>
				</Container>
			</div>
		</PublicLayout>
	);
}

export default function BookingPage() {
	return (
		<Suspense
			fallback={
				<PublicLayout>
					<Container className="flex min-h-[80vh] items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</Container>
				</PublicLayout>
			}>
			<BookingContent />
		</Suspense>
	);
}
