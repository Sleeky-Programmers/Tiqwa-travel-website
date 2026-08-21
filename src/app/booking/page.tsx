'use client';

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { BookingFlow } from '@/components/features/booking/BookingFlow';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container } from '@/components/ui/Container';

export default function BookingPage() {
	return (
		<PublicLayout>
			<Container
				size="md"
				className="py-40 smt-20">
				<Suspense
					fallback={
						<div className="flex min-h-[60vh] items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					}>
					<BookingFlow variant="guest" />
				</Suspense>
			</Container>
		</PublicLayout>
	);
}
