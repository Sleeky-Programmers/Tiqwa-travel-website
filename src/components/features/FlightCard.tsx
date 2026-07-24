'use client';

import { Plane } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatFlightPrice } from '@/services/whitelabel-api';
import { getFlightStops } from '@/types/flight';

import type { Flight } from '@/types/flight';
interface FlightCardProps {
	flight: Flight;
	passengers?: number;
	departure?: string;
	isPublic?: true;
}

export function FlightCard({ flight, passengers = 1, departure = '', isPublic }: FlightCardProps) {
	const stops = getFlightStops(flight);
	const [imageError, setImageError] = useState(false);
	const bookingParams = new URLSearchParams({
		flightId: flight.id,
		passengers: String(passengers),
		departure,
	});

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
				<Button href={isPublic ? `/booking?${bookingParams.toString()}` : `/dashboard/bookings/confirm-booking?${bookingParams.toString()}`} size="sm">
					Select
				</Button>
			</div>
		</Card>
	);
}
