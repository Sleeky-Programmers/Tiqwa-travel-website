'use client';

import { ArrowLeft, CheckCircle, Clock, Copy, CreditCard, Landmark, Loader2, Plane } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { PaymentOptions } from '@/components/features/booking/PaymentOptions';
import { PassengerData, PassengerForm } from '@/components/form/PassengerForm';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import {
	confirmFlightPrice,
	createBooking,
	formatFlightPrice,
	getBankAccounts,
	getFlightFromCache,
	initiatePayment,
	isBookingReservationExpired,
	readActiveBooking,
	readCachedFlightSearch,
	saveActiveBooking,
} from '@/services/whitelabel-api';
import { getFlightStops } from '@/types/flight';

import type { BankAccount, BookingPassengerPayload } from '@/types/whitelabel';

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
	if (!data.documentIssueDate) return 'Document issue date is required.';
	if (!data.documentExpiryDate) return 'Document expiry date is required.';

	const expiryDate = new Date(data.documentExpiryDate);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	if (expiryDate <= today) {
		return 'Document expiry date must be in the future.';
	}

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
		documentIssueDate: '',
		documentExpiryDate: '',
		issuingCountry: '',
		nationalityCountry: '',
		documentType: '',
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
	const [showPaymentOptions, setShowPaymentOptions] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
	const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string | null>(null);
	const [selectedInstalment, setSelectedInstalment] = useState<number | null>(null);
	const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
	const [copied, setCopied] = useState(false);

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
		async function fetchBankAccounts() {
			const result = await getBankAccounts();
			if (result.success) {
				setBankAccounts(result.data);
			}
		}
		fetchBankAccounts();
	}, []);

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

	const isDomestic = useMemo(() => {
		if (!flight) return false;
		return flight.fromCountryCode === flight.toCountryCode;
	}, [flight]);

	const handleProceedToPayment = () => {
		if (!flight) return;

		const validationError = validateAllPassengers();
		if (validationError) {
			setError(validationError);
			return;
		}

		setError(null);
		setShowPaymentOptions(true);
	};

	const handlePaymentSelect = async (method: string, gateway: string, instalment?: number) => {
		if (!flight) return;

		setSelectedPaymentMethod(method);
		setSelectedPaymentGateway(gateway);
		setShowPaymentOptions(false);
		setIsProcessing(true);

		if (instalment) {
			setSelectedInstalment(instalment);
		}

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
				issuing_date: p.documentIssueDate,
				expiry_date: p.documentExpiryDate,
				issuing_country: p.issuingCountry.trim().toUpperCase(),
				nationality_country: p.nationalityCountry.trim().toUpperCase(),
				document_type: p.documentType,
				holder: true,
			},
		}));

		try {
			// Step 1: Create booking
			const createResult = await createBooking(flightId, passengerPayloads);
			if (!createResult.success) {
				setError(createResult.error);
				setIsProcessing(false);
				return;
			}

			const { booking_id, reference } = createResult.data;
			saveActiveBooking({ bookingId: booking_id, reference, flightId });

			// Step 2: Initiate payment
			const paymentResult = await initiatePayment(booking_id, flightId, {
				currency,
				paymentMethod: method,
				...(gateway && { paymentGateway: gateway }),
				...(instalment && { instalment }),
			});

			if (!paymentResult.success) {
				setError(paymentResult.error);
				setIsProcessing(false);
				return;
			}

			setBookingReference(reference);

			if (method === 'WALK_IN_TRANSFER') {
				setBookingSuccess(true);
				setIsProcessing(false);
				return;
			}

			if (!paymentResult.data.authorization_url) {
				setError('Payment URL not returned by gateway');
				setIsProcessing(false);
				return;
			}

			window.location.href = paymentResult.data.authorization_url;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			setIsProcessing(false);
		}
	};

	if (bookingSuccess) {
		if (selectedPaymentMethod === 'WALK_IN_TRANSFER') {
			return (
				<PublicLayout>
					<Container>
						<div className="space-y-6">
							<div className="glossy-card p-8">
								<div className="text-center">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
										<Clock className="h-10 w-10 text-amber-500" />
									</div>
									<h2 className="text-2xl font-bold">Booking is Pending Payment</h2>
									<p className="mt-2 text-muted-foreground">Your booking has been created. Please complete the bank transfer to confirm your booking.</p>

									{/* Booking Reference */}
									<div className="mt-4 rounded-lg bg-primary/80 text-white p-3 py-6">
										<p className="text-sm font-medium">Booking Reference</p>
										<p className="font-mono text-sm tracking-widest">{bookingReference}</p>
									</div>
								</div>

								{/* Bank Details */}
								<div className="mt-6">
									<h3 className="flex items-center gap-2 text-sm font-semibold">
										<Landmark className="h-4 w-4" />
										Bank Transfer Details
									</h3>
									<p className="text-xs text-muted-foreground">Use your booking reference as payment description.</p>
									<div className="mt-3 space-y-3">
										{bankAccounts.length === 0 ? (
											<p className="text-sm text-amber-600">No bank accounts available. Please contact support.</p>
										) : (
											bankAccounts.map((account, index) => (
												<div
													key={index}
													className="rounded-lg border border-primary/20 bg-primary/5 p-4">
													<p className="font-semibold">{account.bank_name || account.bank?.name}</p>
													<p className="text-sm">
														Account Name: <span className="font-medium">{account.account_name}</span>
													</p>
													<p className="text-sm">
														Account Number: <span className="font-mono font-medium text-primary">{account.account_number}</span>
													</p>
												</div>
											))
										)}
									</div>
								</div>

								{/* Important Note */}
								<div className="mt-6 rounded-lg bg-amber-500/10 p-4 text-sm text-amber-700">
									<p className="font-medium">⚠️ Important</p>
									<p>Your booking will remain on hold until payment is confirmed. You'll receive a confirmation email once verified.</p>
								</div>

								{/* Actions */}
								<div className="mt-6 flex flex-col gap-3 sm:flex-row">
									<Link href="/dashboard/bookings">
										<Button className="w-full sm:w-auto">View My Bookings</Button>
									</Link>
									<Button
										variant="outline"
										className="w-full sm:w-auto"
										onClick={() => {
											const details = bankAccounts.map((a) => `${a.bank_name}: ${a.account_number} (${a.account_name})`).join('\n');
											navigator.clipboard.writeText(details);
											setCopied(true);
											setTimeout(() => setCopied(false), 3000);
										}}>
										<Copy className="mr-2 h-4 w-4" />
										{copied ? 'Copied!' : 'Copy Bank Details'}
									</Button>
								</div>
							</div>
						</div>
					</Container>
				</PublicLayout>
			);
		}

		// Other payment methods: Redirecting to payment
		return (
			<PublicLayout>
				<Container>
					<div className="glossy-card p-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircle className="h-10 w-10 text-green-500" />
						</div>
						<h2 className="text-2xl font-bold">Redirecting to Payment...</h2>
						<p className="mt-2 text-muted-foreground">
							Booking reference: <span className="font-mono font-medium">{bookingReference}</span>
						</p>
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

	// Show payment options
	if (showPaymentOptions) {
		return (
			<PublicLayout>
				<Container size="md">
					<div className="space-y-6">
						<div>
							<h1 className="text-2xl font-bold">Choose Payment Method</h1>
							<p className="mt-2 text-sm text-muted-foreground">Select how you want to pay for your flight booking.</p>
						</div>

						<button
							onClick={() => setShowPaymentOptions(false)}
							className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
							<ArrowLeft className="h-4 w-4" />
							Back to passenger details
						</button>

						<Card
							hover={false}
							className="p-6">
							<PaymentOptions
								onSelect={handlePaymentSelect}
								isLoading={isProcessing}
							/>
						</Card>

						{error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
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
						<p className="mt-2 text-sm text-muted-foreground">Enter passenger details to proceed to secure payment.</p>

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
											isDomestic={isDomestic}
										/>
									</Card>
								))}

								<Card hover={false}>
									<div className="flex items-start gap-3">
										<CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
										<div>
											<h3 className="text-lg font-semibold">Secure Payment</h3>
											<p className="mt-1 text-sm text-muted-foreground">After confirming your details, you'll choose your preferred payment method.</p>
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
										onClick={handleProceedToPayment}>
										{isProcessing ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Processing...
											</>
										) : (
											'Proceed to Payment'
										)}
									</Button>

									<p className="mt-3 text-center text-xs text-muted-foreground">Select your preferred payment method after confirming details.</p>
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
