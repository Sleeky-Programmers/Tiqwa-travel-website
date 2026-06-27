'use client';

import { CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { finalizeBooking, getBookingDetails, readActiveBooking, verifyPayment } from '@/services/whitelabel-api';

type VerificationStatus = 'loading' | 'success' | 'failed' | 'not-found' | 'pending';

function VerifyPaymentContent() {
	const searchParams = useSearchParams();
	const reference = searchParams.get('reference');
	const trxref = searchParams.get('trxref');

	const [status, setStatus] = useState<VerificationStatus>('loading');
	const [bookingDetails, setBookingDetails] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const maxAttempts = 3;
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleVerification = useCallback(
		async (isPolling = false) => {
			const ref = reference || trxref;

			if (!ref) {
				setStatus('not-found');
				return;
			}

			if (!trxref) {
				setStatus('not-found');
				return;
			}

			if (!isPolling) {
				setIsRefreshing(true);
			}

			try {
				// Step 1: Verify payment
				const verifyResult = await verifyPayment(ref, trxref);

				if (!verifyResult.success) {
					setError(verifyResult.error || 'Payment verification failed');
					setStatus('failed');
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
					return;
				}

				// Check if payment was successful
				if (verifyResult.data.status === 200) {
					// Step 2: Finalize booking
					const { booking_id, flight_id } = verifyResult.data;
					const finalizeResult = await finalizeBooking(booking_id, flight_id);

					if (!finalizeResult.success) {
						setError(finalizeResult.error || 'Failed to finalize booking');
						setStatus('failed');
						if (pollingIntervalRef.current) {
							clearInterval(pollingIntervalRef.current);
							pollingIntervalRef.current = null;
						}
						return;
					}

					// Step 3: Get booking details for display
					const detailsResult = await getBookingDetails(finalizeResult.data.reference);
					if (detailsResult.success) {
						setBookingDetails(detailsResult.data);
					}

					setStatus('success');
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
				} else {
					// Payment not successful
					setStatus('failed');
					setError('Payment was not successful');
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
				}
			} catch (err) {
				console.error('Verification error:', err);
				setError(err instanceof Error ? err.message : 'Failed to verify payment');
				setStatus('failed');
				if (pollingIntervalRef.current) {
					clearInterval(pollingIntervalRef.current);
					pollingIntervalRef.current = null;
				}
			} finally {
				if (!isPolling) {
					setIsRefreshing(false);
				}
			}
		},
		[reference, trxref]
	);

	// Initial verification
	useEffect(() => {
		handleVerification();

		// Set up polling every 30 seconds for pending/loading states
		pollingIntervalRef.current = setInterval(() => {
			if (status === 'pending' || status === 'loading') {
				handleVerification(true);
			}
		}, 30000);

		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
		};
	}, []);

	// Stop polling after max attempts
	useEffect(() => {
		if (status === 'pending' && attempts >= maxAttempts) {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
		}
	}, [attempts, status]);

	const handleRetry = () => {
		setError(null);
		setStatus('loading');
		setAttempts(0);
		handleVerification();
	};

	const handleRefresh = () => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
		setAttempts(0);
		setStatus('loading');
		handleVerification();

		pollingIntervalRef.current = setInterval(() => {
			if (status === 'pending' || status === 'loading') {
				handleVerification(true);
			}
		}, 30000);
	};

	// Loading state
	if (status === 'loading') {
		return (
			<Container className="flex min-h-[60vh] items-center justify-center">
				<div className="glossy-card p-12 text-center max-w-md">
					<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
					<h2 className="mt-4 text-xl font-semibold">Verifying Payment...</h2>
					<p className="mt-2 text-muted-foreground">Please wait while we confirm your payment.</p>
				</div>
			</Container>
		);
	}

	// Pending state
	if (status === 'pending') {
		return (
			<Container className="flex min-h-[60vh] items-center justify-center">
				<div className="glossy-card p-12 text-center max-w-md">
					<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
					<h2 className="mt-4 text-xl font-semibold">Payment Processing</h2>
					<p className="mt-2 text-muted-foreground">Your payment is still being processed. This may take a few minutes.</p>
					{attempts > 0 && (
						<p className="mt-2 text-sm text-muted-foreground">
							Checking status... Attempt {attempts} of {maxAttempts}
						</p>
					)}
					{attempts >= maxAttempts && <p className="mt-2 text-sm text-amber-600">Taking longer than expected. Please refresh or try again.</p>}
					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Button
							onClick={handleRefresh}
							disabled={isRefreshing}>
							{isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
							Check Again
						</Button>
						<Link href="/">
							<Button variant="outline">Return Home</Button>
						</Link>
					</div>
				</div>
			</Container>
		);
	}

	// Not found
	if (status === 'not-found') {
		return (
			<Container className="flex min-h-[60vh] items-center justify-center">
				<div className="glossy-card p-12 text-center max-w-md">
					<XCircle className="mx-auto h-16 w-16 text-destructive" />
					<h2 className="mt-4 text-xl font-semibold">No Reference Found</h2>
					<p className="mt-2 text-muted-foreground">No payment reference was provided. Please check your email for booking confirmation.</p>
					<Link href="/">
						<Button className="mt-6">Return Home</Button>
					</Link>
				</div>
			</Container>
		);
	}

	// Success
	if (status === 'success') {
		return (
			<Container className="flex min-h-[60vh] items-center justify-center">
				<div className="glossy-card p-12 pt-24 text-center max-w-md">
					<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
					<h2 className="mt-4 text-2xl font-bold">Payment Successful! 🎉</h2>
					<p className="mt-2 text-muted-foreground">Your booking has been confirmed. A confirmation email has been sent to your email address.</p>
					{bookingDetails?.reference && (
						<div className="mt-4 rounded-lg bg-muted text-white p-3">
							<p className="text-sm font-medium">Booking Reference</p>
							<p className="font-mono text-sm tracking-widest">{bookingDetails.reference}</p>
						</div>
					)}
					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Link href="/dashboard/bookings">
							<Button className="w-full sm:w-auto">View My Bookings</Button>
						</Link>
						<Link href="/">
							<Button
								variant="outline"
								className="w-full sm:w-auto">
								Return Home
							</Button>
						</Link>
					</div>
				</div>
			</Container>
		);
	}

	// Failed
	return (
		<Container className="flex min-h-[60vh] items-center justify-center">
			<div className="glossy-card p-12 text-center max-w-md">
				<XCircle className="mx-auto h-16 w-16 text-destructive" />
				<h2 className="mt-4 text-2xl font-bold">Payment Failed</h2>
				<p className="mt-2 text-muted-foreground">{error || "We couldn't confirm your payment. Please try again or contact support."}</p>
				{reference && (
					<div className="mt-4 rounded-lg bg-muted text-white p-3">
						<p className="text-sm font-medium">Reference</p>
						<p className="font-mono text-sm">{reference}</p>
					</div>
				)}
				<div className="mt-6 flex flex-col gap-3 sm:flex-row">
					<Button
						onClick={handleRetry}
						disabled={isRefreshing}>
						{isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
						Try Again
					</Button>
					<Link href="/">
						<Button variant="outline">Return Home</Button>
					</Link>
				</div>
			</div>
		</Container>
	);
}

export default function VerifyPaymentPage() {
	return (
		<PublicLayout>
			<Suspense
				fallback={
					<Container className="flex min-h-[60vh] items-center justify-center">
						<div className="glossy-card p-12 text-center">
							<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
							<h2 className="mt-4 text-xl font-semibold">Loading...</h2>
						</div>
					</Container>
				}>
				<VerifyPaymentContent />
			</Suspense>
		</PublicLayout>
	);
}
