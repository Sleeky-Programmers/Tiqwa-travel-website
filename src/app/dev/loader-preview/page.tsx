'use client';

import { notFound } from 'next/navigation';
import { useState } from 'react';

import { BOOKING_TRANSITION_MESSAGES, FlightSearchLoader, InlineFlightSearchLoader } from '@/components/features/search/FlightSearchLoader';

const SAMPLE = {
	from: 'Lagos (LOS)',
	to: 'Enugu (ENU)',
	departureDate: '2026-09-15',
	passengers: 2,
	cabinLabel: 'Economy',
};

export default function LoaderPreviewPage() {
	if (process.env.NODE_ENV === 'production') notFound();

	const [variant, setVariant] = useState<'search' | 'booking' | 'inline' | null>(null);

	return (
		<div className="min-h-screen space-y-4 bg-secondary p-8">
			<div className="mx-auto max-w-md space-y-2 rounded-2xl border border-border bg-background-card p-5">
				<h1 className="text-lg font-bold">Loader Preview (dev only)</h1>
				<p className="text-sm text-muted-foreground">Force the transition UI open for visual QA — no search or checkout flow needed.</p>
				<div className="flex flex-wrap gap-2 pt-2">
					<button
						className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
						onClick={() => setVariant('search')}>
						Full-screen: Search
					</button>
					<button
						className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
						onClick={() => setVariant('booking')}>
						Full-screen: Booking
					</button>
					<button
						className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
						onClick={() => setVariant('inline')}>
						Inline (in-page)
					</button>
					{variant && (
						<button
							className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
							onClick={() => setVariant(null)}>
							Close
						</button>
					)}
				</div>
			</div>

			{variant === 'inline' && (
				<div className="mx-auto max-w-md rounded-2xl border border-border bg-background-card">
					<InlineFlightSearchLoader {...SAMPLE} />
				</div>
			)}

			<FlightSearchLoader
				show={variant === 'search'}
				{...SAMPLE}
			/>
			<FlightSearchLoader
				show={variant === 'booking'}
				{...SAMPLE}
				messages={BOOKING_TRANSITION_MESSAGES}
				label="Preparing your booking"
			/>
		</div>
	);
}
