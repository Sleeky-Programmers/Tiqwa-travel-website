'use client';

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { BookingFlow } from '@/components/features/booking/BookingFlow';

export default function DashboardConfirmBookingPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col items-center justify-center py-20">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<p className="mt-4 text-sm text-muted-foreground">Loading booking details...</p>
				</div>
			}>
			<BookingFlow variant="account" />
		</Suspense>
	);
}
