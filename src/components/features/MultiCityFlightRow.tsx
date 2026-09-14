'use client';

import { Plane } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { FlightSummaryModal } from '@/components/features/FlightSummaryModal';
import {
    BOOKING_TRANSITION_MESSAGES, FlightSearchLoader
} from '@/components/features/search/FlightSearchLoader';
import { Button } from '@/components/ui/Button';
import { formatFlightPrice } from '@/services/whitelabel-api';

import type { Flight } from '@/types/flight';
import type { OutboundSegment } from '@/types/whitelabel';

interface MultiCityFlightRowProps {
	flight: Flight;
	segments: OutboundSegment[];
	passengers: number;
	departure: string;
}

function formatTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes}m`;
}

export function MultiCityFlightRow({ flight, segments, passengers, departure }: MultiCityFlightRowProps) {
	const router = useRouter();
	const [imageError, setImageError] = useState(false);
	const [showSummary, setShowSummary] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const pendingContinueRef = useRef(false);
	const firstSegment = segments[0];
	const lastSegment = segments[segments.length - 1];
	const stops = Math.max(0, segments.length - 1);

	if (!firstSegment || !lastSegment) return null;

	const bookingParams = new URLSearchParams({
		flightId: flight.id,
		passengers: String(passengers),
		departure,
	});

	const handleContinue = () => {
		pendingContinueRef.current = true;
		setShowSummary(false);
	};

	const handleSummaryCloseAnimationEnd = () => {
		if (!pendingContinueRef.current) return;
		pendingContinueRef.current = false;
		setIsNavigating(true);
		setTimeout(() => router.push(`/booking?${bookingParams.toString()}`), 900);
	};

	return (
		<div className="rounded-md border border-border bg-background-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
				<div className="flex min-w-0 items-center gap-3 lg:w-52 lg:shrink-0">
					<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white">
						{firstSegment.airline_details?.logo && !imageError ? (
							<Image
								src={firstSegment.airline_details.logo}
								alt={`${firstSegment.airline_details.name} logo`}
								fill
								className="object-contain p-0"
								onError={() => setImageError(true)}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-primary">
								<Plane className="h-5 w-5" />
							</div>
						)}
					</div>
					<div className="min-w-0">
						<p className="truncate font-semibold">{firstSegment.airline_details?.name ?? flight.airline}</p>
						<p className="truncate text-sm text-muted-foreground">
							{firstSegment.airport_from} → {lastSegment.airport_to}
						</p>
					</div>
				</div>

				<div className="flex flex-1 items-center justify-between gap-3 sm:gap-5">
					<div className="text-center">
						<p className="text-lg font-bold leading-none">{formatTime(firstSegment.departure_time)}</p>
						<p className="mt-1 text-xs text-muted-foreground">{firstSegment.airport_from}</p>
					</div>
					<div className="flex min-w-20 flex-1 flex-col items-center gap-1.5">
						<span className="text-xs text-muted-foreground">
							{formatDuration(firstSegment.duration + (segments.length > 1 ? segments.slice(1).reduce((total, segment) => total + segment.duration, 0) : 0))}
						</span>
						<div className="h-px w-full border-t border-dashed border-border" />
						<span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
							{stops === 0 ? 'Non-Stop' : `${stops} Stop${stops > 1 ? 's' : ''}`}
						</span>
					</div>
					<div className="text-center">
						<p className="text-lg font-bold leading-none">{formatTime(lastSegment.arrival_time)}</p>
						<p className="mt-1 text-xs text-muted-foreground">{lastSegment.airport_to}</p>
					</div>
				</div>

				<div className="flex items-center justify-between gap-4 border-t border-border pt-4 lg:w-auto lg:shrink-0 lg:flex-row lg:justify-end lg:border-t-0 lg:pt-0">
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
		</div>
	);
}
