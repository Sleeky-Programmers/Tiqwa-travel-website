'use client';

import {
    AlertCircle, ArrowLeft, Briefcase, CheckCircle, ChevronLeft, ChevronRight, Clock, Copy,
    CreditCard, Globe2, Landmark, Loader2, Lock, PhoneCall, Plane, Search, Shield, ShieldCheck, Upload,
    User, Wallet
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PaymentOptions } from '@/components/features/booking/PaymentOptions';
import { PassengerData, PassengerForm } from '@/components/form/PassengerForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, linkVariants } from '@/components/ui/Link';
import { useAuth } from '@/contexts/AuthContext';
import { clearCheckoutDraft, readCheckoutDraft, writeCheckoutDraft } from '@/lib/checkoutDraft';
import { cn } from '@/lib/utils';
import {
    confirmFlightPrice, createBooking, formatFlightPrice, getBankAccounts, getBookingDetails,
    getFlightFromCache, initiatePayment, isBookingReservationExpired, readActiveBooking,
    readCachedFlightSearch, reserveBooking, saveActiveBooking, validateFlightCoupon
} from '@/services/whitelabel-api';
import { getFlightStops } from '@/types/flight';

import type { BankAccount, BookingPassengerPayload, PassengerType } from '@/types/whitelabel';

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

function formatRouteLabel(flight: NonNullable<ReturnType<typeof getFlightFromCache>>): string {
	const routes = flight.multiCityRoutes;
	if (!routes?.length) return `${flight.from} → ${flight.to}`;

	const stops = routes.flatMap((segments, routeIndex) => {
		const first = segments[0];
		const last = segments[segments.length - 1];
		if (!first || !last) return [];
		const from = `${first.airport_from_details?.city ?? first.airport_from} (${first.airport_from_details?.iata_code ?? first.airport_from})`;
		const to = `${last.airport_to_details?.city ?? last.airport_to} (${last.airport_to_details?.iata_code ?? last.airport_to})`;
		return [from, ...(routeIndex === routes.length - 1 ? [to] : [])];
	});

	return stops.join(' → ');
}

const PASSENGER_FARE_LABELS: Record<string, string> = {
	adult: 'Adults',
	child: 'Children',
	infant: 'Infants',
};

function normalizePhone(value: string): string {
	return value.replace(/[^\d+]/g, '');
}

function formatCountdown(ms: number): string {
	if (ms <= 0) return 'Expired';
	const totalMinutes = Math.floor(ms / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${hours} hrs ${minutes} mins`;
}

function formatExpiryDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatExpiryTime(dateString: string): string {
	return new Date(dateString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function validatePassenger(data: PassengerData, documentRequired: boolean, requiresContact: boolean): string | null {
	if (!data.firstName.trim()) return 'First name is required.';
	if (!data.lastName.trim()) return 'Last name is required.';
	if (!data.title) return 'Title is required.';
	if (!data.gender) return 'Gender is required.';
	if (requiresContact) {
		if (!data.email.trim()) return 'Email is required.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
			return 'Please enter a valid email address.';
		}
		if (!data.phone.trim()) return 'Phone number is required.';
		if (normalizePhone(data.phone).length < 10) {
			return 'Please enter a valid phone number.';
		}
	}
	if (!data.dateOfBirth) return 'Date of birth is required.';
	if (data.dateOfBirth >= new Date().toISOString().split('T')[0]) {
		return 'Date of birth must be in the past.';
	}

	if (!documentRequired) return null;

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

function buildPassengerTypes(adults: number, children: number, infants: number, total: number): PassengerType[] {
	const types: PassengerType[] = [
		...Array.from({ length: adults }, () => 'adult' as const),
		...Array.from({ length: children }, () => 'child' as const),
		...Array.from({ length: infants }, () => 'infant' as const),
	];
	while (types.length < total) types.push('adult');
	return types.slice(0, total);
}

const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
	adult: 'Adult',
	child: 'Child',
	infant: 'Infant',
};

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

	const { user } = useAuth();
	const hasPrefilledRef = useRef(false);

	const searchParams = useSearchParams();
	const flightId = searchParams.get('flightId') ?? '';
	const passengersCount = Number(searchParams.get('passengers') ?? '1');
	const departure = searchParams.get('departure') ?? '';
	const flight = getFlightFromCache(flightId);

	const [passengers, setPassengers] = useState<PassengerData[]>(() => {
		const length = Math.max(1, passengersCount);
		return readCheckoutDraft(flightId, length) ?? Array.from({ length }, () => getInitialPassenger());
	});
	const [activePassengerIndex, setActivePassengerIndex] = useState(0);

	// Auto-save passenger details as the user types, so an accidental refresh or back-nav
	// doesn't wipe out a long passport-details form. Skipped while every field is still empty.
	useEffect(() => {
		if (!flightId) return;
		const hasData = passengers.some((p) => Object.values(p).some((v) => v !== ''));
		if (!hasData) return;

		const timer = setTimeout(() => writeCheckoutDraft(flightId, passengers), 400);
		return () => clearTimeout(timer);
	}, [passengers, flightId]);

	// Passenger type composition (adult/child/infant) from the original search — falls back to
	// "everyone is an adult" for older links that predate the adults/children/infants breakdown.
	const [passengerTypes, setPassengerTypes] = useState<PassengerType[]>(() => {
		const hasBreakdown = searchParams.has('adults');
		const adultsCount = hasBreakdown ? Math.max(0, Number(searchParams.get('adults') ?? '0') || 0) : passengersCount;
		const childrenCount = hasBreakdown ? Math.max(0, Number(searchParams.get('children') ?? '0') || 0) : 0;
		const infantsCount = hasBreakdown ? Math.max(0, Number(searchParams.get('infants') ?? '0') || 0) : 0;
		return buildPassengerTypes(adultsCount, childrenCount, infantsCount, Math.max(1, passengersCount));
	});

	// Prefill the first passenger (the account holder) with known profile details.
	// Runs once, only for logged-in bookings, and only fills fields the user hasn't already typed into.
	useEffect(() => {
		if (variant !== 'account' || !user || hasPrefilledRef.current) return;
		hasPrefilledRef.current = true;

		setPassengers((prev) => {
			const updated = [...prev];
			const first = updated[0];
			updated[0] = {
				...first,
				firstName: first.firstName || user.firstName || '',
				lastName: first.lastName || user.lastName || '',
				email: first.email || user.email || '',
				phone: first.phone || (user.phone ? formatPhoneNumber(user.phone) : ''),
			};
			return updated;
		});
	}, [variant, user]);
	const [confirmedPrice, setConfirmedPrice] = useState<number | null>(null);
	// Not required unless the confirm-price response explicitly says so.
	const [documentRequired, setDocumentRequired] = useState(false);
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
	const [bookingExpiresAt, setBookingExpiresAt] = useState<string | null>(null);
	const [proofFile, setProofFile] = useState<File | null>(null);
	const [paymentConfirmedLocally, setPaymentConfirmedLocally] = useState(false);
	const [nowTick, setNowTick] = useState(() => Date.now());

	useEffect(() => {
		if (!bookingExpiresAt) return;
		const interval = setInterval(() => setNowTick(Date.now()), 60000);
		return () => clearInterval(interval);
	}, [bookingExpiresAt]);

	const unitPrice = confirmedPrice ?? flight?.price ?? 0;
	const currency = flight?.currency ?? 'NGN';
	const subtotal = unitPrice * passengersCount;
	const [couponDiscount, setCouponDiscount] = useState(0);
	const total = Math.max(0, subtotal - couponDiscount);
	const passengerBreakdown = useMemo(() => {
		const counts = passengerTypes.reduce<Record<string, number>>((result, type) => {
			result[type] = (result[type] ?? 0) + 1;
			return result;
		}, {});
		return (['adult', 'child', 'infant'] as PassengerType[])
			.filter((type) => counts[type])
			.map((type) => ({
				type,
				label: PASSENGER_FARE_LABELS[type],
				singular: type === 'adult' ? 'Adult' : type === 'child' ? 'Child' : 'Infant',
				plural: type === 'adult' ? 'Adults' : type === 'child' ? 'Children' : 'Infants',
				count: counts[type],
			}));
	}, [passengerTypes]);
	const fareBreakdown = useMemo(() => {
		if (!flight?.priceSummary?.length) return [];
		return flight.priceSummary
			.filter((item) => item.quantity > 0 && item.total_price > 0)
			.map((item) => ({
				label: PASSENGER_FARE_LABELS[item.passenger_type.toLowerCase()] ?? item.passenger_type,
				quantity: item.quantity,
				unitPrice: item.total_price / item.quantity,
			}));
	}, [flight?.priceSummary]);
	const [coupon, setCoupon] = useState('');
	const [couponMessage, setCouponMessage] = useState<string | null>(null);
	const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
	const [couponApplied, setCouponApplied] = useState(false);

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

			return `${resultsPath}?from=${encodeURIComponent(currentFlight.from)}&to=${encodeURIComponent(
				currentFlight.to
			)}&departure=${departureDate}&passengers=${passengers}`;
		},
		[resultsPath]
	);

	const resultsHref = useMemo(
		() => (flight ? buildResultsHref(flight, departure, passengersCount) : searchPath),
		[flight, departure, passengersCount, buildResultsHref, searchPath]
	);

	const confirmPrice = useCallback(async () => {
		if (!flightId) {
			setIsConfirmingPrice(false);
			return;
		}

		setIsConfirmingPrice(true);
		const result = await confirmFlightPrice(flightId);
		if (result.success) {
			if (result.data.amount != null) {
				setConfirmedPrice(result.data.amount);
			}
			setDocumentRequired(Boolean(result.data.document_required));
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
			const validationError = validatePassenger(passengers[i], documentRequired, i === 0);
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

	const handleCouponApply = async () => {
		const couponCode = coupon.trim();
		setCouponMessage(null);
		setCouponDiscount(0);
		setCouponApplied(false);
		if (!couponCode) {
			setCouponMessage('Enter a coupon code.');
			return;
		}

		setIsApplyingCoupon(true);
		const result = await validateFlightCoupon(subtotal, couponCode);
		setIsApplyingCoupon(false);

		if (!result.success || !result.data.is_valid) {
			setCouponMessage(result.success ? 'Invalid or used Promo Code' : result.error);
			return;
		}

		setCouponDiscount(Math.min(result.data.discount, subtotal));
		setCouponApplied(true);
		setCouponMessage('Promo code applied successfully.');
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

		const passengerPayloads: BookingPassengerPayload[] = passengers.map((p, i) => ({
			passenger_type: passengerTypes[i] ?? 'adult',
			first_name: p.firstName.trim(),
			last_name: p.lastName.trim(),
			middle_name: p.middleName.trim() || null,
			dob: p.dateOfBirth,
			gender: p.gender,
			title: p.title,
			email: passengers[0].email.trim(),
			phone_number: normalizePhone(passengers[0].phone),
			...(documentRequired
				? {
						documents: {
							number: p.documentNumber.trim(),
							issuing_date: p.documentIssueDate,
							expiry_date: p.documentExpiryDate,
							issuing_country: p.issuingCountry.trim().toUpperCase(),
							nationality_country: p.nationalityCountry.trim().toUpperCase(),
							document_type: p.documentType,
							holder: true,
						},
				  }
				: {}),
		}));

		try {
			const createResult = await createBooking(flightId, passengerPayloads, documentRequired);
			if (!createResult.success) {
				setError(createResult.error);
				setIsProcessing(false);
				return;
			}

			const { booking_id, reference } = createResult.data;
			saveActiveBooking({ bookingId: booking_id, reference, flightId });
			clearCheckoutDraft(flightId);

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
				const detailsResult = await getBookingDetails(reference);
				setBookingExpiresAt(detailsResult.success ? detailsResult.data.expires_at || null : null);
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

	if (!flight) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="rounded-2xl bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<Plane className="h-8 w-8 text-destructive/60" />
					</div>
					<p className="text-lg font-semibold">Flight not found</p>
					<p className="mt-2 text-sm text-muted-foreground max-w-md">Please select a flight from the search results.</p>
					<Button
						href={searchPath}
						shape="pill"
						className="mt-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35">
						<Search className="mr-2 h-4 w-4" />
						Search for flights
					</Button>
				</div>
			</div>
		);
	}

	const paymentStepSummary = (
		<div className="rounded-md border border-border/70 bg-white p-6 shadow-sm dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
			<div className="flex items-center gap-3 border-b border-border/60 pb-4">
				<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-white/50 p-1.5 dark:bg-white/5">
					{flight.airlineLogo && !imageError ? (
						<Image
							src={flight.airlineLogo}
							alt={`${flight.airline} logo`}
							fill
							className="object-contain"
							onError={() => setImageError(true)}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center rounded-md bg-primary/10 text-primary">
							<Plane className="h-5 w-5" />
						</div>
					)}
				</div>
				<div className="min-w-0">
					<p className="truncate font-semibold">{flight.airline}</p>
					<p className="truncate text-sm text-muted-foreground">{formatRouteLabel(flight)}</p>
				</div>
			</div>
			<div className="mt-4 space-y-3 text-sm">
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">Departure</span>
					<span className="font-medium">{flight.departure}</span>
				</div>
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">Arrival</span>
					<span className="font-medium">{flight.arrival}</span>
				</div>
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">Duration</span>
					<span className="font-medium">{flight.duration}</span>
				</div>
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">Stops</span>
					<span className="font-medium">{getFlightStops(flight) === 0 ? 'Non-stop' : `${getFlightStops(flight)} stop${getFlightStops(flight) > 1 ? 's' : ''}`}</span>
				</div>
				{departure && (
					<div className="flex justify-between gap-3">
						<span className="text-muted-foreground">Date</span>
						<span className="font-medium">{departure}</span>
					</div>
				)}
				<div className="flex justify-between gap-3">
					<span className="text-muted-foreground">Passengers</span>
					<span className="text-right font-medium">
						{passengerBreakdown.map(({ singular, plural, count }, index) => (
							<span key={singular}>
								{index > 0 && ', '}
								{count} {count > 1 ? plural : singular}
							</span>
						))}
					</span>
				</div>
			</div>
			<div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
				{fareBreakdown.map(({ label, quantity, unitPrice: fareUnitPrice }) => (
					<div
						key={label}
						className="flex justify-between gap-3">
						<span className="text-muted-foreground">{label} Base Fare</span>
						<span className="font-medium">
							{formatFlightPrice(fareUnitPrice, 'NGN')} × {quantity}
						</span>
					</div>
				))}
				{couponDiscount > 0 && (
					<div className="flex justify-between gap-3">
						<span className="text-muted-foreground">Coupon discount</span>
						<span className="font-medium text-emerald-600">-{formatFlightPrice(couponDiscount, 'NGN')}</span>
					</div>
				)}
				<div className="flex justify-between border-t border-border/60 pt-3 text-lg font-bold">
					<span>Total</span>
					<span className="text-primary">{formatFlightPrice(total, 'NGN')}</span>
				</div>
			</div>
			<Button
				className="mt-6 w-full rounded-md bg-black text-white shadow-lg shadow-black/25"
				size="lg"
				disabled>
				<Briefcase className="mr-2 h-4 w-4 text-white" />
				Proceed to Payment
			</Button>
			<p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-black">
				<ShieldCheck className="h-3.5 w-3.5 text-black" />
				Your information is secure and encrypted
			</p>
		</div>
	);

	// ============================================
	// SUCCESS STATE - Walk In Transfer
	// ============================================
	if (bookingSuccess && selectedPaymentMethod === 'WALK_IN_TRANSFER') {
		const expiresInMs = bookingExpiresAt ? new Date(bookingExpiresAt).getTime() - nowTick : null;

		return (
			<div className="space-y-7 page-fade-in">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
					<div>
						<button
							onClick={() => {
								setBookingSuccess(false);
								setShowPaymentOptions(true);
							}}
							className={cn(linkVariants({ variant: 'back' }), 'pt-2 hover:gap-3')}>
							<ArrowLeft className="h-4 w-4" />
							Back to Payment Methods
						</button>
						<h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Pending Payment</h1>
						<p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
							<Wallet className="h-4 w-4" />
							Please follow the instructions below to complete your booking reservation.
						</p>
					</div>
					<div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:flex">
						<ShieldCheck className="h-3 w-3" />
						Secure Booking
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
					<div className="rounded-md border border-border/70 bg-white p-6 shadow-sm dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none sm:p-8">
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Clock className="h-8 w-8 text-primary" />
							</div>
							<h2 className="text-xl font-bold">Booking is On Hold</h2>
							<p className="mt-2 text-sm text-muted-foreground">Your booking has been created. Please complete the bank transfer to confirm your flights.</p>

							<div className="mt-6 inline-block rounded-xl border border-border bg-secondary/60 px-6 py-4">
								<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Booking Reference</p>
								<p className="mt-1 font-mono text-lg font-bold tracking-widest">{bookingReference}</p>
							</div>
						</div>

						{/* Bank Details */}
						<div className="mt-8 border-t border-border/60 pt-6">
							<h3 className="flex items-center gap-2 text-sm font-semibold">
								<Landmark className="h-4 w-4" />
								Bank Transfer Details
							</h3>
							<p className="mt-1 text-xs text-muted-foreground">Use your booking reference as payment description.</p>

							<div className="mt-4 space-y-3">
								{bankAccounts.length === 0 ? (
									<p className="text-sm text-destructive">No bank accounts available. Please contact support.</p>
								) : (
									bankAccounts.map((account, index) => (
										<div
											key={index}
											className="rounded-xl border border-border bg-secondary/30 p-4">
											<p className="font-semibold">{account.bank_name || account.bank?.name}</p>
											<div className="mt-2 space-y-1 text-sm">
												<div className="flex justify-between gap-3">
													<span className="text-muted-foreground">Account Name:</span>
													<span className="font-medium">{account.account_name}</span>
												</div>
												<div className="flex justify-between gap-3">
													<span className="text-muted-foreground">Account Number:</span>
													<span className="font-mono font-bold">{account.account_number}</span>
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>

						{/* Important Note */}
						<div className="mt-6 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
							<p>
								<span className="font-semibold">Important:</span> Your booking will remain on hold until payment is confirmed. You&apos;ll receive a confirmation email once
								verified.
							</p>
						</div>

						{/* Confirm Payment */}
						<div className="mt-6">
							<h3 className="text-sm font-semibold">Confirm Your Payment</h3>
							<p className="mt-1 text-xs text-muted-foreground">Upload your proof of payment so we can verify and confirm your booking.</p>

							<label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/10">
								<input
									type="file"
									accept=".png,.jpg,.jpeg,.pdf"
									className="hidden"
									onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
								/>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
									<Upload className="h-5 w-5" />
								</div>
								<p className="text-sm font-semibold">{proofFile ? proofFile.name : 'Upload proof of payment'}</p>
								<p className="text-xs text-muted-foreground">PNG, JPG, PDF (max 10MB)</p>
							</label>

							{paymentConfirmedLocally ? (
								<div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
									<CheckCircle className="h-4 w-4 shrink-0" />
									Thanks! We&apos;ll verify your payment and confirm your booking shortly.
								</div>
							) : (
								<div className="mt-4 flex flex-col gap-3 sm:flex-row">
									<Button
										className="w-full sm:w-auto"
										disabled={!proofFile}
										onClick={() => setPaymentConfirmedLocally(true)}>
										I&apos;ve Made Payment
									</Button>
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
							)}
						</div>

						{bookingExpiresAt && expiresInMs !== null && (
							<div className="mt-6 flex items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3 text-sm">
								<Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
								<div>
									<p className="font-medium">Expires in: {formatCountdown(expiresInMs)}</p>
									<p className="text-xs text-muted-foreground">
										Complete your payment before {formatExpiryDate(bookingExpiresAt)} • {formatExpiryTime(bookingExpiresAt)}
									</p>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-6 lg:sticky lg:top-24">
						{paymentStepSummary}
						<div className="rounded-md border border-border/70 bg-white p-5 shadow-sm dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
							<div className="space-y-3 text-xs font-semibold text-muted-foreground">
								<span className="flex items-center gap-2">
									<Globe2 className="h-4 w-4 shrink-0 text-primary" />
									Instant Confirmation &amp; E-ticket
								</span>
								<span className="flex items-center gap-2">
									<ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
									Secure SSL-Encrypted Booking
								</span>
								<span className="flex items-center gap-2">
									<PhoneCall className="h-4 w-4 shrink-0 text-primary" />
									24/7 Priority Helpline Support
								</span>
							</div>
						</div>
					</div>
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
					className={cn(linkVariants({ variant: 'back' }), 'pt-2 hover:gap-3')}>
					<ArrowLeft className="h-4 w-4" />
					Back to passenger details
				</button>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
					<div className="rounded-md border border-border/70 bg-white p-6 shadow-sm dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
						<PaymentOptions
							onSelect={handlePaymentSelect}
							isLoading={isProcessing}
						/>
					</div>
					<div className="lg:sticky lg:top-24">{paymentStepSummary}</div>
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
			<Link
				href={resultsHref}
				variant="back"
				className="pt-2">
				Back to results
			</Link>

			{/* Header */}
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Complete Your Booking</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<User className="h-4 w-4" />
						Enter details for all passengers to secure your tickets on this flight.
					</p>
				</div>
				<div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					<ShieldCheck className="h-3 w-3" />
					Secure Booking
				</div>
			</div>

			{passengers.length > 1 && (
				<div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background-card p-2 shadow-sm">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setActivePassengerIndex((index) => Math.max(0, index - 1))}
						disabled={activePassengerIndex === 0}
						aria-label="Previous passenger">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto">
						{passengers.map((_, index) => (
							<button
								key={index}
								type="button"
								onClick={() => setActivePassengerIndex(index)}
								className={cn(
									'whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors',
									activePassengerIndex === index ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
								)}>
								{index === 0 && passengerTypes[index] === 'adult' ? 'Primary contact' : `Passenger ${index + 1}`}
								<span className="ml-1 font-normal opacity-80">{PASSENGER_TYPE_LABELS[passengerTypes[index] ?? 'adult']}</span>
							</button>
						))}
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setActivePassengerIndex((index) => Math.min(passengers.length - 1, index + 1))}
						disabled={activePassengerIndex === passengers.length - 1}
						aria-label="Next passenger">
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Error & Warning */}
			{error && (
				<div className="flex items-center gap-2.5 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
					<AlertCircle className="h-5 w-5" />
					{error}
				</div>
			)}

			{reservationWarning && (
				<div className="flex items-start gap-2.5 rounded-md bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 border border-amber-500/20">
					<Clock className="mt-0.5 h-5 w-5 shrink-0" />
					{reservationWarning}
				</div>
			)}

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left: Passenger Forms — shown after the summary on mobile */}
				<div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
					<div className="rounded-md border border-border bg-background-card p-5 shadow-sm sm:p-6">
						<PassengerForm
							data={passengers[activePassengerIndex]}
							onChange={(data) => handlePassengerChange(activePassengerIndex, data)}
							passengerNumber={activePassengerIndex + 1}
							totalPassengers={passengers.length}
							passengerType={passengerTypes[activePassengerIndex]}
							showRemove={passengers.length > 1}
							onRemove={() => {
								setPassengers((prev) => prev.filter((_, index) => index !== activePassengerIndex));
								setPassengerTypes((prev) => prev.filter((_, index) => index !== activePassengerIndex));
								setActivePassengerIndex((index) => Math.max(0, Math.min(index, passengers.length - 2)));
							}}
							isDomestic={isDomestic}
							showContactFields={false}
							documentRequired={documentRequired}
							disabled={showPaymentOptions || isProcessing}
						/>
					</div>

					<div className="rounded-md border border-border bg-background-card p-5 shadow-sm sm:p-6">
						<h2 className="text-lg font-semibold">Contact Information</h2>
						<p className="mt-1 text-sm text-muted-foreground">We&apos;ll send your booking confirmation and updates here.</p>
						<div className="mt-5 grid gap-4 sm:grid-cols-2">
							<Input
								required
								disabled={showPaymentOptions || isProcessing}
								type="tel"
								label="Phone Number"
								value={passengers[0].phone}
								placeholder="+234 801 234 5678"
								onChange={handlePhoneChange(0)}
							/>
							<Input
								required
								disabled={showPaymentOptions || isProcessing}
								type="email"
								label="Email Address"
								value={passengers[0].email}
								placeholder="john@example.com"
								onChange={(event) => handlePassengerChange(0, { ...passengers[0], email: event.target.value })}
							/>
						</div>
					</div>
				</div>

				{/* Right: Flight Summary — shown first on mobile */}
				<div className="order-1 lg:order-2">
					<div className="lg:sticky lg:top-24 space-y-6">
						{/* Flight Summary Card */}
						<div className="rounded-md border border-border/70 bg-white p-6 shadow-sm dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
							<div className="flex items-center gap-3 pb-4 border-b border-border/60">
								<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-white/50 p-1.5 dark:bg-white/5">
									{flight.airlineLogo && !imageError ? (
										<Image
											src={flight.airlineLogo}
											alt={`${flight.airline} logo`}
											fill
											className="object-contain"
											onError={() => setImageError(true)}
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center rounded-md bg-primary/10 text-primary">
											<Plane className="h-5 w-5" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold truncate">{flight.airline}</p>
									<p className="text-sm text-muted-foreground truncate">{formatRouteLabel(flight)}</p>
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
									<span className="text-right font-medium">
										{passengerBreakdown.map(({ singular, plural, count }, index) => (
											<span key={singular}>
												{index > 0 && ', '}
												{count} {count > 1 ? plural : singular}
											</span>
										))}
									</span>
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
										<div className="space-y-2 text-sm">
											{fareBreakdown.length > 0 ? (
												fareBreakdown.map(({ label, quantity, unitPrice: fareUnitPrice }) => (
													<div
														key={label}
														className="flex justify-between gap-3">
														<span className="text-muted-foreground">{label} Base Fare</span>
														<span className="shrink-0 font-medium">
															{formatFlightPrice(fareUnitPrice, 'NGN')} × {quantity}
														</span>
													</div>
												))
											) : (
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Base Fare</span>
													<span className="font-medium">
														{formatFlightPrice(unitPrice, 'NGN')} × {passengers.length}
													</span>
												</div>
											)}
										</div>

										<div className="mt-4 flex items-center gap-2">
											<input
												value={coupon}
												onChange={(event) => {
													setCoupon(event.target.value);
													setCouponApplied(false);
													setCouponDiscount(0);
													setCouponMessage(null);
												}}
												placeholder="Coupon code"
												className={`h-10 min-w-0 flex-1 rounded-sm border-2 px-3 text-sm text-black outline-none placeholder:text-gray-500 ${
													couponApplied ? 'border-emerald-500/60 bg-emerald-50 focus:border-emerald-600' : 'border-black bg-white focus:border-black'
												}`}
											/>
											<button
												type="button"
												onClick={handleCouponApply}
												disabled={isApplyingCoupon}
												className={`h-10 shrink-0 rounded-sm px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
													couponApplied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-black hover:bg-black/80'
												}`}>
												{isApplyingCoupon ? 'Checking...' : couponApplied ? 'Applied' : 'Apply'}
											</button>
										</div>
										{couponDiscount > 0 && (
											<div className="mt-3 flex justify-between gap-3 text-sm">
												<span className="text-muted-foreground">Discount ({Math.round((couponDiscount / subtotal) * 100)}%)</span>
												<span className="font-medium text-emerald-600">-{formatFlightPrice(couponDiscount, 'NGN')}</span>
											</div>
										)}
										{couponMessage && <p className={`mt-2 text-xs ${couponDiscount > 0 ? 'text-emerald-600' : 'text-destructive'}`}>{couponMessage}</p>}

										<div className="mt-4 flex justify-between text-xl font-bold">
											<span>Total</span>
											<span className="text-primary">{formatFlightPrice(total, 'NGN')}</span>
										</div>
									</>
								)}
							</div>

							<Button
								className="mt-6 w-full rounded-md bg-black text-white shadow-lg shadow-black/25 transition-all hover:scale-[1.02] hover:bg-black hover:shadow-xl hover:shadow-black/35"
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
										<Briefcase className="mr-2 h-4 w-4 text-white" />
										Proceed to Payment
									</>
								)}
							</Button>

							<p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-black">
								<ShieldCheck className="h-3.5 w-3.5 text-black" />
								Your information is secure and encrypted
							</p>
						</div>

						{/* Trust Badges */}
						<div className="space-y-3 text-xs font-semibold text-muted-foreground">
							<span className="flex items-center gap-2">
								<Globe2 className="h-4 w-4 shrink-0 text-[#E8503A]" />
								Instant Confirmation &amp; E-ticket
							</span>
							<span className="flex items-center gap-2">
								<ShieldCheck className="h-4 w-4 shrink-0 text-[#E8503A]" />
								Secure SSL-Encrypted Payment
							</span>
							<span className="flex items-center gap-2">
								<PhoneCall className="h-4 w-4 shrink-0 text-[#E8503A]" />
								24/7 Priority Helpline Support
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
