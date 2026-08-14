'use client';

import { Plane } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { FlightSummaryModal } from '@/components/features/FlightSummaryModal';
import { BOOKING_TRANSITION_MESSAGES, FlightSearchLoader } from '@/components/features/search/FlightSearchLoader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatFlightPrice } from '@/services/whitelabel-api';
import { getFlightStops } from '@/types/flight';

import type { Flight } from '@/types/flight';
interface FlightCardProps {
	flight: Flight;
	passengers?: number;
	adults?: number;
	children?: number;
	infants?: number;
	departure?: string;
	isPublic?: true;
}

export function FlightCard({ flight, passengers = 1, adults, children, infants, departure = '', isPublic }: FlightCardProps) {
	const router = useRouter();
	const stops = getFlightStops(flight);
	const [imageError, setImageError] = useState(false);
	const [showSummary, setShowSummary] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const pendingContinueRef = useRef(false);
	const bookingParams = new URLSearchParams({
		flightId: flight.id,
		passengers: String(passengers),
		departure,
		...(adults !== undefined ? { adults: String(adults) } : {}),
		...(children !== undefined ? { children: String(children) } : {}),
		...(infants !== undefined ? { infants: String(infants) } : {}),
	});
	const bookingHref = isPublic ? `/booking?${bookingParams.toString()}` : `/dashboard/bookings/confirm-booking?${bookingParams.toString()}`;

	const handleContinue = () => {
		// Don't open the transition overlay yet — wait for the dialog's own close animation to
		// actually finish (onCloseAnimationEnd below). Opening both at once briefly shows two
		// overlapping full-screen layers.
		pendingContinueRef.current = true;
		setShowSummary(false);
	};

	const handleSummaryCloseAnimationEnd = () => {
		if (!pendingContinueRef.current) return;
		pendingContinueRef.current = false;
		setIsNavigating(true);
		setTimeout(() => router.push(bookingHref), 900);
	};

	return (
		<Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-4">
				{/* Airline Logo */}
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
					<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
						<span>
							{flight.departure} – {flight.arrival}
						</span>
						<span>{flight.duration}</span>
						<span>{stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-4 sm:flex-col sm:items-end">
				<div className="text-right">
					<p className="text-2xl font-bold text-primary">{formatFlightPrice(flight.price, flight.currency)}</p>
					<p className="text-xs text-muted-foreground">per person</p>
				</div>
				<Button
					size="sm"
					onClick={() => setShowSummary(true)}>
					Select
				</Button>
			</div>

			<FlightSummaryModal
				flight={flight}
				open={showSummary}
				onOpenChange={setShowSummary}
				onContinue={handleContinue}
				onCloseAnimationEnd={handleSummaryCloseAnimationEnd}
				passengers={passengers}
			/>

			<FlightSearchLoader
				show={isNavigating}
				from={flight.from}
				to={flight.to}
				departureDate={departure}
				passengers={passengers}
				messages={BOOKING_TRANSITION_MESSAGES}
				label="Preparing your booking"
			/>
		</Card>
	);
}
