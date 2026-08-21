'use client';

import { ArrowRight, Briefcase, CalendarDays, Clock, Info, Plane, ShieldCheck, ShieldX } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDuration, formatFlightPrice } from '@/services/whitelabel-api';
import type { Flight } from '@/types/flight';
import type { OutboundSegment } from '@/types/whitelabel';

interface FlightSummaryModalProps {
	flight: Flight | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onContinue: () => void;
	/** Fires once the dialog's own close animation has actually finished (data-state="closed"). */
	onCloseAnimationEnd?: () => void;
	passengers?: number;
}

function formatSegmentDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	} catch {
		return iso;
	}
}

function formatSegmentTime(iso: string): string {
	try {
		return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
	} catch {
		return iso;
	}
}

function SegmentRow({ segment, isLast }: { segment: OutboundSegment; isLast: boolean }) {
	return (
		<div className="flex gap-3">
			<div className="flex w-10 shrink-0 flex-col items-center">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Plane className="h-4 w-4" />
				</div>
				{!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
			</div>

			<div className="flex-1 pb-6">
				<div className="flex flex-wrap items-center gap-2">
					{segment.airline_details?.logo && (
						<div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border border-border bg-white/60">
							<Image
								src={segment.airline_details.logo}
								alt={segment.airline_details.name ?? 'Airline logo'}
								fill
								className="object-contain p-0.5"
							/>
						</div>
					)}
					<p className="text-sm font-semibold">{segment.airline_details?.name ?? 'Airline'}</p>
					<span className="text-xs text-muted-foreground">{segment.flight_number}</span>
					{segment.cabin_type && (
						<span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">{segment.cabin_type}</span>
					)}
				</div>

				<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
					<span className="font-medium">{formatSegmentTime(segment.departure_time)}</span>
					<span className="text-muted-foreground">
						{segment.airport_from_details?.city ?? segment.airport_from} ({segment.airport_from_details?.iata_code ?? segment.airport_from})
					</span>
					<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
					<span className="font-medium">{formatSegmentTime(segment.arrival_time)}</span>
					<span className="text-muted-foreground">
						{segment.airport_to_details?.city ?? segment.airport_to} ({segment.airport_to_details?.iata_code ?? segment.airport_to})
					</span>
				</div>

				<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<CalendarDays className="h-3 w-3" />
						{formatSegmentDate(segment.departure_time)}
					</span>
					<span className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{formatDuration(segment.duration)}
					</span>
					{segment.overnight && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400">Overnight</span>}
				</div>

				{segment.baggage && (
					<p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
						<Briefcase className="mt-0.5 h-3 w-3 shrink-0" />
						{segment.baggage}
					</p>
				)}

				{!isLast && segment.layover && (
					<div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
						Layover in {segment.airport_to_details?.city ?? segment.airport_to} — {segment.layover}
					</div>
				)}
			</div>
		</div>
	);
}

function FlightLeg({ title, segments }: { title: string; segments: OutboundSegment[] }) {
	if (segments.length === 0) return null;
	return (
		<div>
			<h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
			{segments.map((segment, i) => (
				<SegmentRow
					key={`${segment.flight_number}-${i}`}
					segment={segment}
					isLast={i === segments.length - 1}
				/>
			))}
		</div>
	);
}

function passengerTypeLabel(type: string): string {
	if (type === 'adult') return 'Adult';
	if (type === 'child') return 'Child';
	if (type === 'infant') return 'Infant';
	return type.charAt(0).toUpperCase() + type.slice(1);
}

export function FlightSummaryModal({ flight, open, onOpenChange, onContinue, onCloseAnimationEnd, passengers = 1 }: FlightSummaryModalProps) {
	if (!flight) return null;

	const multiCityRoutes = flight.isMultiCity ? flight.multiCityRoutes ?? [] : null;
	const outbound = flight.outboundSegments ?? [];
	const inbound = flight.inboundSegments ?? [];

	const allSegments = multiCityRoutes ? multiCityRoutes.flat() : [...outbound, ...inbound];
	const fareRules = Array.from(new Set(allSegments.flatMap((seg) => seg.fare_rules ?? [])));

	const isRefundable = (multiCityRoutes ? multiCityRoutes[0]?.[0]?.refundable : outbound[0]?.refundable) ?? false;
	const payable = flight.pricing?.payable;
	const showPayable = payable !== undefined && payable !== flight.price;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[85vh] overflow-y-auto sm:max-w-xl"
				onAnimationEnd={(e) => {
					if (e.currentTarget.getAttribute('data-state') === 'closed') {
						onCloseAnimationEnd?.();
					}
				}}>
				<DialogHeader>
					<DialogTitle>Flight Summary</DialogTitle>
					<p className="text-sm text-muted-foreground">
						{flight.from} → {flight.to} · {passengers} passenger{passengers > 1 ? 's' : ''}
					</p>
				</DialogHeader>

				<div className="space-y-6">
					{multiCityRoutes ? (
						multiCityRoutes.map((segments, i) => (
							<FlightLeg
								key={i}
								title={`Flight ${i + 1}`}
								segments={segments}
							/>
						))
					) : (
						<>
							<FlightLeg
								title="Outbound"
								segments={outbound}
							/>
							<FlightLeg
								title="Return"
								segments={inbound}
							/>
						</>
					)}

					{/* Fare conditions */}
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={
								isRefundable
									? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'
									: 'inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400'
							}>
							{isRefundable ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldX className="h-3.5 w-3.5" />}
							{isRefundable ? 'Refundable' : 'Non-refundable'}
						</span>
						{flight.bookingClass && <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">Class {flight.bookingClass}</span>}
					</div>

					{fareRules.length > 0 && (
						<div className="rounded-xl border border-border bg-secondary/40 p-3">
							<p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
								<Info className="h-3.5 w-3.5" />
								Fare rules
							</p>
							<ul className="space-y-1 text-xs text-muted-foreground">
								{fareRules.map((rule, i) => (
									<li
										key={i}
										className="flex gap-1.5">
										<span aria-hidden="true">•</span>
										{rule}
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Price breakdown */}
					<div className="rounded-xl border border-border p-3">
						<p className="mb-2 text-xs font-semibold text-foreground">Price breakdown</p>
						<div className="space-y-1.5 text-sm">
							{(flight.priceSummary ?? []).map((row, i) => (
								<div
									key={i}
									className="flex items-center justify-between">
									<span className="text-muted-foreground">
										{row.quantity} × {passengerTypeLabel(row.passenger_type)}
									</span>
									<span className="font-medium">{formatFlightPrice(row.total_price, flight.currency)}</span>
								</div>
							))}
							{flight.pricing?.tax != null && (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Tax</span>
									<span className="font-medium">{formatFlightPrice(flight.pricing.tax, flight.currency)}</span>
								</div>
							)}
						</div>
						<div className="mt-2 flex items-center justify-between border-t border-border pt-2">
							<span className="text-sm font-semibold">Total</span>
							<span className="text-lg font-bold text-primary">{formatFlightPrice(flight.price, flight.currency)}</span>
						</div>
						{showPayable && payable !== undefined && (
							<p className="mt-1 text-right text-xs text-muted-foreground">Payable now: {formatFlightPrice(payable, flight.currency)}</p>
						)}
					</div>
				</div>

				<DialogFooter className="mt-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Close
					</Button>
					<Button onClick={onContinue}>Continue to Book</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
