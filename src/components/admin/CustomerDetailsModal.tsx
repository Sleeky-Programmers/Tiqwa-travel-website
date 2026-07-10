'use client';

import { format, isValid, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BookingStatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatNaira } from '@/data/admin-mock-data';
import { getFlightBookings } from '@/services/whitelabel-api';
import { formatPhoneNumber } from '@/utils/phone';

import type { AdminCustomer } from '@/services/whitelabel-api';
import type { FlightBooking } from '@/services/whitelabel-api';

interface Booking {
	id: string;
	reference: string;
	route: string;
	amount: number;
	status: 'PAID' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';
	booking_date: string;
}

function formatDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : dateStr;
}

function formatLongDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'PPP') : dateStr;
}

function mapBookingStatus(status: string): 'PAID' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' {
	if (status === 'BOOKED' || status === 'CONFIRMED') return 'PAID';
	if (status === 'CANCELLED') return 'CANCELLED';
	return 'PENDING_PAYMENT';
}

interface CustomerDetailsModalProps {
	customer: AdminCustomer | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsModal({ customer, open, onOpenChange }: CustomerDetailsModalProps) {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function loadCustomerBookings() {
			if (!customer?.email) return;
			setIsLoading(true);
			try {
				const result = await getFlightBookings();
				if (result.success) {
					const customerBookings = result.data
						.filter((b: FlightBooking) => {
							const passengerEmail = b.passengers?.[0]?.email;
							return passengerEmail === customer.email;
						})
						.map((b: FlightBooking) => ({
							id: b.id,
							reference: b.reference,
							route: `${b.from} → ${b.to}`,
							amount: b.payable_amount || b.amount || 0,
							status: mapBookingStatus(b.status),
							booking_date: b.booking_date || b.created_at || '',
						}));
					setBookings(customerBookings);
				}
			} catch (error) {
				console.error('Failed to load customer bookings:', error);
			} finally {
				setIsLoading(false);
			}
		}

		if (customer && open) {
			loadCustomerBookings();
		}
	}, [customer, open]);

	if (!customer) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="glossy max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{customer.name}</DialogTitle>
					<DialogDescription>Customer profile and booking history</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="glossy space-y-2 rounded-xl p-4">
						<h4 className="text-sm font-semibold">Profile Information</h4>
						<div className="grid gap-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Email</span>
								<span>{customer.email}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Phone</span>
								<span>{customer.phone_number ? formatPhoneNumber(customer.phone_number) : '—'}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Date of Birth</span>
								<span>{formatLongDate(customer.date_of_birth)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Gender</span>
								<span className="capitalize">{customer.gender || '—'}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Joined</span>
								{/* <span>{customer.joined_date ? formatLongDate(customer.joined_date) : '—'}</span> */}
							</div>
						</div>
					</div>

					<div className="glossy rounded-xl p-4">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-semibold">Loyalty Points</h4>
							<span className="text-lg font-bold text-amber-600 dark:text-amber-400">{customer.loyalty_reward ?? 0} pts</span>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">{customer.bookings_count ?? bookings.length} total bookings</p>
					</div>

					<div className="glossy space-y-3 rounded-xl p-4">
						<h4 className="text-sm font-semibold">Booking History</h4>
						{isLoading ? (
							<p className="text-sm text-muted-foreground">Loading bookings...</p>
						) : bookings.length === 0 ? (
							<p className="text-sm text-muted-foreground">No bookings yet</p>
						) : (
							bookings.map((booking) => (
								<div
									key={booking.id}
									className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
									<div>
										<p className="font-mono text-xs font-medium">{booking.reference}</p>
										<p className="text-sm">{booking.route}</p>
										<p className="text-xs text-muted-foreground">{formatDate(booking.booking_date)}</p>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium">{formatNaira(booking.amount)}</p>
										<BookingStatusBadge status={booking.status} />
									</div>
								</div>
							))
						)}
					</div>
				</div>

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<Button
						variant="outline"
						disabled
						title="Coming soon">
						Edit Details
					</Button>
					<Button
						variant="destructive"
						disabled
						title="Coming soon">
						Suspend Account
					</Button>
					<Link href={`/admin/bookings?search=${encodeURIComponent(customer.email)}`}>
						<Button variant="ghost">
							<Calendar className="h-4 w-4" />
							View All Bookings
						</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
