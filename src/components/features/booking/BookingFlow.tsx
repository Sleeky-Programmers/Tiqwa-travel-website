'use client';

import { AlertCircle, ArrowLeft, CheckCircle, Clock, Copy, CreditCard, Landmark, Loader2, Lock, Plane, Search, Shield, User } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PaymentOptions } from '@/components/features/booking/PaymentOptions';
import { PassengerData, PassengerForm } from '@/components/form/PassengerForm';
import { Button } from '@/components/ui/Button';
import { Link, linkVariants } from '@/components/ui/Link';
import { cn } from '@/lib/utils';
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
	reserveBooking,
	saveActiveBooking,
} from '@/services/whitelabel-api';
import { getFlightStops } from '@/types/flight';

import type { BankAccount, BookingPassengerPayload } from '@/types/whitelabel';

export type BookingFlowVariant = 'guest' | 'account';

function formatPhoneNumber(value: string): string {
	const cleaned = value.replace(/[^\d+]/g, '');
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

function getInitialPassenger(): PassengerData {
	return {
		firstName: '',
		middleName: '',
		lastName: '',
		title: '',
		gender: '',
		email: '',
		phone: '',
		dateOfBirth: '',
		documentType: '',
		documentNumber: '',
		issuingCountry: '',
		documentIssueDate: '',
		documentExpiryDate: '',
		nationalityCountry: '',
	};
}

export function BookingFlow({ variant }: { variant: BookingFlowVariant }) {
	const resultsPath = variant === 'guest' ? '/results' : '/dashboard/search/results';
	const searchPath = variant === 'guest' ? '/search' : '/dashboard/search';

	const searchParams = useSearchParams();
	const flightId = searchParams.get('flightId') ?? '';
	const passengersCount = Number(searchParams.get('passengers') ?? '1');
	const departure = searchParams.get('departure') ?? '';
	const flight = getFlightFromCache(flightId);

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
	const [, setSelectedPaymentGateway] = useState<string | null>(null);
	const [, setSelectedInstalment] = useState<number | null>(null);
	const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
	const [copied, setCopied] = useState(false);

	const unitPrice = confirmedPrice ?? flight?.price ?? 0;
	const currency = flight?.currency ?? 'NGN';
	const total = unitPrice * passengersCount;

	const buildResultsHref = useCallback(
		(currentFlight: NonNullable<ReturnType<typeof getFlightFromCache>>, departureDate: string, passengers: number): string => {
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
				return `${resultsPath}?${urlParams.toString()}`;
			}

			return `${resultsPath}?from=${encodeURIComponent(currentFlight.from)}&to=${encodeURIComponent(currentFlight.to)}&departure=${departureDate}&passengers=${passengers}`;
		},
		[resultsPath]
	);

	const resultsHref = useMemo(() => (flight ? buildResultsHref(flight, departure, passengersCount) : searchPath), [flight, departure, passengersCount, buildResultsHref, searchPath]);

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
			const validationError = validatePassenger(passengers[i]);
			if (validationError) {
				return `Passenger ${i + 1}: ${validationError}`;
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
			const createResult = await createBooking(flightId, passengerPayloads);
			if (!createResult.success) {
				setError(createResult.error);
				setIsProcessing(false);
				return;
			}

			const { booking_id, reference } = createResult.data;
			saveActiveBooking({ bookingId: booking_id, reference, flightId });

			const reserveResult = await reserveBooking(booking_id, flightId);
			if (!reserveResult.success) {
				setError(reserveResult.error || 'Failed to reserve booking');
				setIsProcessing(false);
				return;
			}

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

	// ============================================
	// SUCCESS STATE - Walk In Transfer
	// ============================================
	if (bookingSuccess && selectedPaymentMethod === 'WALK_IN_TRANSFER') {
		return (
			<div className="space-y-7 page-fade-in">
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:from-amber-500/20 dark:via-primary/10">
					<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
					<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

					<div className="relative z-10 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15">
							<Clock className="h-10 w-10 text-amber-500" />
						</div>
						<h2 className="text-2xl font-bold">Booking is Pending Payment</h2>
						<p className="mt-2 text-muted-foreground max-w-md mx-auto">Your booking has been created. Please complete the bank transfer to confirm your booking.</p>

						<div className="mt-6 inline-block rounded-xl bg-primary/10 px-6 py-4">
							<p className="text-sm font-medium text-muted-foreground">Booking Reference</p>
							<p className="font-mono text-lg tracking-widest font-bold text-primary">{bookingReference}</p>
						</div>
					</div>

					{/* Bank Details */}
					<div className="relative z-10 mt-8">
						<h3 className="flex items-center justify-center gap-2 text-sm font-semibold">
							<Landmark className="h-4 w-4 text-primary" />
							Bank Transfer Details
						</h3>
						<p className="text-center text-xs text-muted-foreground">Use your booking reference as payment description.</p>

						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							{bankAccounts.length === 0 ? (
								<p className="col-span-2 text-center text-sm text-amber-600 dark:text-amber-400">No bank accounts available. Please contact support.</p>
							) : (
								bankAccounts.map((account, index) => (
									<div
										key={index}
										className="rounded-xl border border-primary/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-white/5">
										<p className="font-semibold text-primary">{account.bank_name || account.bank?.name}</p>
										<p className="mt-1 text-sm">
											<span className="text-muted-foreground">Account Name:</span> <span className="font-medium">{account.account_name}</span>
										</p>
										<p className="text-sm">
											<span className="text-muted-foreground">Account Number:</span> <span className="font-mono font-bold text-primary">{account.account_number}</span>
										</p>
									</div>
								))
							)}
						</div>
					</div>

					{/* Important Note */}
					<div className="relative z-10 mt-6 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400 border border-amber-500/20">
						<p className="font-medium flex items-center gap-2">
							<AlertCircle className="h-4 w-4" />
							Important
						</p>
						<p className="mt-1">Your booking will remain on hold until payment is confirmed. You&apos;ll receive a confirmation email once verified.</p>
					</div>

					{/* Actions */}
					<div className="relative z-10 mt-6 flex flex-col sm:flex-row gap-3 justify-center">
						<Button href="/dashboard/bookings" className="w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35">
							<ArrowLeft className="mr-2 h-4 w-4" />
							View My Bookings
						</Button>
						<Button
							variant="outline"
							className="w-full sm:w-auto rounded-xl hover:bg-primary/10 hover:text-primary"
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
		);
	}

	if (bookingSuccess) {
		return (
			<div className="space-y-7 page-fade-in">
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:from-emerald-500/20 dark:via-primary/10">
					<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

					<div className="relative z-10">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
							<CheckCircle className="h-10 w-10 text-emerald-500" />
						</div>
						<h2 className="text-2xl font-bold">Redirecting to Payment...</h2>
						<p className="mt-2 text-muted-foreground">
							Booking reference: <span className="font-mono font-medium text-primary">{bookingReference}</span>
						</p>
						<div className="mt-6 flex items-center justify-center gap-3">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
							<span className="text-sm text-muted-foreground">Please wait...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!flight) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<Plane className="h-8 w-8 text-destructive/60" />
					</div>
					<p className="text-lg font-semibold">Flight not found</p>
					<p className="mt-2 text-sm text-muted-foreground max-w-md">Please select a flight from the search results.</p>
					<Button href={searchPath} shape="pill" className="mt-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35">
						<Search className="mr-2 h-4 w-4" />
						Search for flights
					</Button>
				</div>
			</div>
		);
	}

	// ============================================
	// PAYMENT OPTIONS
	// ============================================
	if (showPaymentOptions) {
		return (
			<div className="space-y-7 page-fade-in">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Choose Payment Method</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<CreditCard className="h-4 w-4" />
						Select how you want to pay for your flight booking.
					</p>
				</div>

				<button
					onClick={() => setShowPaymentOptions(false)}
					className={cn(linkVariants({ variant: 'back' }), 'hover:gap-3')}>
					<ArrowLeft className="h-4 w-4" />
					Back to passenger details
				</button>

				<div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<PaymentOptions
						onSelect={handlePaymentSelect}
						isLoading={isProcessing}
					/>
				</div>

				{error && (
					<div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
						<AlertCircle className="h-5 w-5" />
						{error}
					</div>
				)}
			</div>
		);
	}

	// ============================================
	// MAIN BOOKING FORM
	// ============================================
	return (
		<div className="space-y-7 page-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Complete Your Booking</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<User className="h-4 w-4" />
						Enter passenger details to proceed to secure payment.
					</p>
				</div>
				<div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					<Shield className="h-3 w-3" />
					Secure Booking
				</div>
			</div>

			<Link href={resultsHref} variant="back">
				Back to results
			</Link>

			{/* Error & Warning */}
			{error && (
				<div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
					<AlertCircle className="h-5 w-5" />
					{error}
				</div>
			)}

			{reservationWarning && (
				<div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 border border-amber-500/20">
					<Clock className="mt-0.5 h-5 w-5 shrink-0" />
					{reservationWarning}
				</div>
			)}

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left: Passenger Forms */}
				<div className="space-y-6 lg:col-span-2">
					<div className="flex items-center gap-3 mb-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">{passengers.length}</div>
						<h2 className="text-lg font-semibold">Passenger{passengers.length > 1 ? 's' : ''} Details</h2>
					</div>

					{passengers.map((passenger, index) => (
						<div
							key={index}
							className="relative rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
							<div className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg shadow-primary/25">
								{index + 1}
							</div>
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
						</div>
					))}
				</div>

				{/* Right: Flight Summary */}
				<div>
					<div className="sticky top-24 space-y-6">
						{/* Flight Summary Card */}
						<div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
							<div className="flex items-center gap-3 pb-4 border-b border-border/60">
								<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white/50 p-1.5 dark:bg-white/5">
									{flight.airlineLogo && !imageError ? (
										<Image
											src={flight.airlineLogo}
											alt={`${flight.airline} logo`}
											fill
											className="object-contain"
											onError={() => setImageError(true)}
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Plane className="h-5 w-5" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold truncate">{flight.airline}</p>
									<p className="text-sm text-muted-foreground truncate">
										{flight.from} → {flight.to}
									</p>
								</div>
							</div>

							<div className="mt-4 space-y-3">
								<div className="flex justify-between text-sm py-1.5 border-b border-border/40">
									<span className="text-muted-foreground">Departure</span>
									<span className="font-medium">{flight.departure}</span>
								</div>
								<div className="flex justify-between text-sm py-1.5 border-b border-border/40">
									<span className="text-muted-foreground">Arrival</span>
									<span className="font-medium">{flight.arrival}</span>
								</div>
								<div className="flex justify-between text-sm py-1.5 border-b border-border/40">
									<span className="text-muted-foreground">Duration</span>
									<span className="font-medium">{flight.duration}</span>
								</div>
								<div className="flex justify-between text-sm py-1.5 border-b border-border/40">
									<span className="text-muted-foreground">Stops</span>
									<span className="font-medium">
										{getFlightStops(flight) === 0 ? 'Non-stop' : `${getFlightStops(flight)} stop${getFlightStops(flight) > 1 ? 's' : ''}`}
									</span>
								</div>
								{departure && (
									<div className="flex justify-between text-sm py-1.5 border-b border-border/40">
										<span className="text-muted-foreground">Date</span>
										<span className="font-medium">{departure}</span>
									</div>
								)}
								<div className="flex justify-between text-sm py-1.5">
									<span className="text-muted-foreground">Passengers</span>
									<span className="font-medium">{passengers.length}</span>
								</div>
							</div>

							{/* Price */}
							<div className="mt-4 pt-4 border-t border-border/60">
								{isConfirmingPrice ? (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										Confirming latest price...
									</div>
								) : (
									<>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												{formatFlightPrice(unitPrice, currency)} × {passengers.length}
											</span>
											<span>{formatFlightPrice(total, currency)}</span>
										</div>
										<div className="mt-2 flex justify-between text-xl font-bold">
											<span>Total</span>
											<span className="text-primary">{formatFlightPrice(total, currency)}</span>
										</div>
									</>
								)}
							</div>

							<Button
								className="mt-6 w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-[1.02]"
								size="lg"
								disabled={isProcessing || isConfirmingPrice}
								onClick={handleProceedToPayment}>
								{isProcessing ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									<>
										<CreditCard className="mr-2 h-4 w-4" />
										Proceed to Payment
									</>
								)}
							</Button>

							<p className="mt-3 text-center text-xs text-muted-foreground">🔒 Your information is secure and encrypted</p>
						</div>

						{/* Trust Badges */}
						<div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<Shield className="h-4 w-4 text-emerald-500" />
								Secure Payment
							</span>
							<span className="flex items-center gap-1.5">
								<Lock className="h-4 w-4 text-emerald-500" />
								Encrypted Data
							</span>
							<span className="flex items-center gap-1.5">
								<CheckCircle className="h-4 w-4 text-emerald-500" />
								Instant Confirmation
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
