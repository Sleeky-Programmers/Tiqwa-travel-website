'use client';

import { ArrowLeft, Loader2, Plane } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { formatFlightPrice, getBookingDetails } from '@/services/whitelabel-api';

import type { BookingDetails } from '@/types/whitelabel';
function BookingDetailsContent() {
	const params = useParams();
	const ref = params.ref as string;
	const [details, setDetails] = useState<BookingDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			const result = await getBookingDetails(ref);
			if (result.success) {
				setDetails(result.data);
			} else {
				setError(result.error ?? 'Could not load booking details');
			}
			setIsLoading(false);
		}

		if (ref) load();
	}, [ref]);

	if (isLoading) {
		return (
			<PublicLayout>
				<Container className="flex min-h-[60vh] items-center justify-center py-28">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</Container>
			</PublicLayout>
		);
	}

	if (error || !details) {
		return (
			<PublicLayout>
				<Container className="py-28">
					<div className="glossy-card mx-auto max-w-lg p-8 text-center">
						<p className="text-destructive">{error ?? 'Booking not found'}</p>
						<Link
							href="/dashboard/bookings"
							className="mt-4 inline-block">
							<Button variant="outline">Back to Bookings</Button>
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
						href="/dashboard/bookings"
						className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
						<ArrowLeft className="h-4 w-4" />
						Back to bookings
					</Link>

					<Card
						hover={false}
						className="p-6">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Plane className="h-6 w-6" />
							</div>
							<div>
								<h1 className="text-xl font-bold">Booking Details</h1>
								<p className="font-mono text-sm text-muted-foreground">{details.reference}</p>
							</div>
						</div>

						<div className="mt-6 space-y-3 text-sm">
							{details.status && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Status</span>
									<span className="capitalize font-medium">{details.status}</span>
								</div>
							)}
							{details.amount != null && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Amount</span>
									<span className="font-semibold text-primary">{formatFlightPrice(Number(details.amount), details.currency ?? 'NGN')}</span>
								</div>
							)}
						</div>
					</Card>
				</Container>
			</div>
		</PublicLayout>
	);
}

export default function BookingDetailsPage() {
	return (
		<Suspense
			fallback={
				<Container className="flex min-h-[60vh] items-center justify-center py-28">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</Container>
			}>
			<BookingDetailsContent />
		</Suspense>
	);
}
