'use client';

import { format, isValid, parseISO } from 'date-fns';
import { ExternalLink } from 'lucide-react';

import { BookingStatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { AdminBooking } from '@/data/admin-mock-data';
import { formatNaira, getCustomerByEmail } from '@/data/admin-mock-data';
import { formatPhoneNumber } from '@/utils/phone';

function formatDate(dateStr: string): string {
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'PPP') : dateStr;
}

interface BookingDetailsModalProps {
	booking: AdminBooking | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BookingDetailsModal({ booking, open, onOpenChange }: BookingDetailsModalProps) {
	if (!booking) return null;

	const customer = getCustomerByEmail(booking.email);
	const priceBreakdown = booking.price_breakdown ?? {
		base_fare: booking.amount * 0.87,
		taxes: booking.amount * 0.13,
		total: booking.amount,
	};
	const passengers = booking.passenger_details ?? [];

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="glossy max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-mono">{booking.reference}</DialogTitle>
					<DialogDescription>Booking details and passenger information</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p className="text-xs text-muted-foreground">Booking Date</p>
							<p className="text-sm font-medium">{formatDate(booking.booking_date)}</p>
						</div>
						<BookingStatusBadge status={booking.status} />
					</div>

					<div className="glossy space-y-2 rounded-xl p-4">
						<h4 className="text-sm font-semibold">Flight Summary</h4>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Route</span>
								<span className="font-medium">{booking.route}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Airline</span>
								<span>{booking.airline}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Departure</span>
								<span>{booking.departure_date ? formatDate(booking.departure_date) : '—'}</span>
							</div>
							{booking.return_date && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Return</span>
									<span>{formatDate(booking.return_date)}</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="text-muted-foreground">Passengers</span>
								<span>{booking.passengers}</span>
							</div>
						</div>
					</div>

					<div className="glossy space-y-2 rounded-xl p-4">
						<h4 className="text-sm font-semibold">Customer Information</h4>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Name</span>
								<span>{booking.customer}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Email</span>
								<span>{booking.email}</span>
							</div>
							{customer && (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Phone</span>
										<span>{formatPhoneNumber(customer.phone_number)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Loyalty Points</span>
										<span className="font-medium text-amber-600 dark:text-amber-400">
											{customer.loyalty_reward} pts
										</span>
									</div>
								</>
							)}
						</div>
					</div>

					<div className="glossy space-y-2 rounded-xl p-4">
						<h4 className="text-sm font-semibold">Price Breakdown</h4>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Base Fare</span>
								<span>{formatNaira(priceBreakdown.base_fare)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Taxes & Fees</span>
								<span>{formatNaira(priceBreakdown.taxes)}</span>
							</div>
							<div className="flex justify-between border-t border-border pt-2 font-semibold">
								<span>Total</span>
								<span className="text-primary">{formatNaira(priceBreakdown.total)}</span>
							</div>
						</div>
					</div>

					{passengers.length > 0 && (
						<div className="glossy space-y-3 rounded-xl p-4">
							<h4 className="text-sm font-semibold">Passenger Details</h4>
							{passengers.map((passenger, index) => (
								<div
									key={index}
									className="space-y-1 border-b border-border/60 pb-3 text-sm last:border-0 last:pb-0">
									<div className="flex items-center justify-between">
										<span className="font-medium">{passenger.name}</span>
										<span className="capitalize text-muted-foreground">{passenger.type}</span>
									</div>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>DOB: {formatDate(passenger.dob)}</span>
										{passenger.document_number && <span>Doc: {passenger.document_number}</span>}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<Button
						variant="outline"
						disabled
						title="Coming soon">
						Update Status
					</Button>
					<Button
						variant="destructive"
						disabled
						title="Coming soon">
						Cancel Booking
					</Button>
					<Button
						variant="ghost"
						disabled
						title="Coming soon">
						<ExternalLink className="h-4 w-4" />
						View in Dashboard
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
