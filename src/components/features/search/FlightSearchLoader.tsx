'use client';

import { ArrowRight, Globe2, Plane } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface FlightLoaderContentProps {
	from?: string;
	to?: string;
	departureDate?: string;
	returnDate?: string;
	passengers?: number;
	cabinLabel?: string;
	compact?: boolean;
}

const SEARCH_MESSAGES = ['Searching for the best fares...', 'Comparing hundreds of airlines...', 'Checking real-time availability...', 'Almost there...'];

function placeLabel(value?: string): string {
	if (!value) return '';
	return value.split('(')[0].trim();
}

function formatDateLabel(value?: string): string {
	if (!value) return '';
	const parsed = new Date(value.includes('T') ? value : `${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function FlightLoaderContent({ from, to, departureDate, returnDate, passengers, cabinLabel, compact = false }: FlightLoaderContentProps) {
	const [messageIndex, setMessageIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setMessageIndex((i) => (i + 1) % SEARCH_MESSAGES.length);
		}, 1800);
		return () => clearInterval(interval);
	}, []);

	const origin = placeLabel(from);
	const destination = placeLabel(to);
	const hasRoute = Boolean(origin && destination);
	const dateLabel = departureDate ? formatDateLabel(departureDate) + (returnDate ? ` – ${formatDateLabel(returnDate)}` : '') : '';
	const passengerLabel = passengers ? `${passengers} Passenger${passengers > 1 ? 's' : ''}${cabinLabel ? `, ${cabinLabel}` : ''}` : '';

	const orbitSize = compact ? 'h-24 w-24' : 'h-32 w-32';
	const globeSize = compact ? 'h-16 w-16' : 'h-20 w-20';
	const globeIconSize = compact ? 'h-8 w-8' : 'h-10 w-10';

	return (
		<>
			{/* Orbit animation */}
			<div className={`relative flex items-center justify-center ${orbitSize}`}>
				<div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/25" />
				<div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 ${globeSize}`}>
					<Globe2 className={`animate-[spin_8s_linear_infinite] text-primary/70 ${globeIconSize}`} />
				</div>
				<div className="absolute inset-0 animate-[orbit_3s_linear_infinite]">
					<div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 animate-[orbit-counter_3s_linear_infinite]">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40">
							<Plane className="h-4 w-4 -rotate-45" />
						</div>
					</div>
				</div>
			</div>

			{/* Route */}
			{hasRoute ? (
				<div className="mt-5 flex items-center gap-2">
					<p className="text-base font-bold text-foreground">{origin}</p>
					<ArrowRight className="h-4 w-4 shrink-0 text-primary" />
					<p className="text-base font-bold text-foreground">{destination}</p>
				</div>
			) : null}

			{/* Cycling reassurance message */}
			<div className="relative mt-3 h-5 w-full overflow-hidden">
				<AnimatePresence mode="wait">
					<motion.p
						key={messageIndex}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.3 }}
						className="absolute inset-x-0 text-sm text-muted-foreground">
						{SEARCH_MESSAGES[messageIndex]}
					</motion.p>
				</AnimatePresence>
			</div>

			{/* Trip details */}
			{(dateLabel || passengerLabel) && (
				<div className="mt-3 flex flex-col gap-0.5 text-xs text-muted-foreground/80">
					{dateLabel && <p>{dateLabel}</p>}
					{passengerLabel && <p>{passengerLabel}</p>}
				</div>
			)}
		</>
	);
}

interface FlightSearchLoaderProps {
	show: boolean;
	from?: string;
	to?: string;
	departureDate?: string;
	returnDate?: string;
	passengers?: number;
	cabinLabel?: string;
}

export function FlightSearchLoader({ show, from, to, departureDate, returnDate, passengers, cabinLabel }: FlightSearchLoaderProps) {
	const origin = placeLabel(from);
	const destination = placeLabel(to);
	const ariaLabel = origin && destination ? `Searching for flights from ${origin} to ${destination}` : 'Searching for flights';

	return (
		<AnimatePresence>
			{show && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.25 }}
					role="status"
					aria-live="polite"
					aria-label={ariaLabel}
					className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-lg">
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="mx-4 flex w-full max-w-sm flex-col items-center rounded-3xl bg-background-card p-8 text-center shadow-2xl">
						<FlightLoaderContent
							from={from}
							to={to}
							departureDate={departureDate}
							returnDate={returnDate}
							passengers={passengers}
							cabinLabel={cabinLabel}
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

interface InlineFlightSearchLoaderProps {
	from?: string;
	to?: string;
	departureDate?: string;
	returnDate?: string;
	passengers?: number;
	cabinLabel?: string;
	className?: string;
}

export function InlineFlightSearchLoader({ from, to, departureDate, returnDate, passengers, cabinLabel, className }: InlineFlightSearchLoaderProps) {
	const origin = placeLabel(from);
	const destination = placeLabel(to);
	const ariaLabel = origin && destination ? `Searching for flights from ${origin} to ${destination}` : 'Searching for flights';

	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={ariaLabel}
			className={`flex flex-col items-center justify-center p-10 text-center ${className ?? ''}`}>
			<FlightLoaderContent
				from={from}
				to={to}
				departureDate={departureDate}
				returnDate={returnDate}
				passengers={passengers}
				cabinLabel={cabinLabel}
				compact
			/>
		</div>
	);
}
