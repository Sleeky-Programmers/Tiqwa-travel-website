'use client';

import { format, isValid, parseISO } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle, ChevronRight, Clock, CreditCard, Gift, Plane, Search, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { FlightBooking, formatFlightPrice, getFlightBookings, getRewardsData } from '@/services/whitelabel-api';

interface DashboardStats {
	totalBookings: number;
	upcomingTrips: number;
	totalRewards: number;
	totalSpent: number;
	completionRate: number;
}

function formatBookingDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : dateStr;
}

function isUpcoming(dateStr: string): boolean {
	if (!dateStr) return false;
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) && parsed > new Date();
}

function isPast(dateStr: string): boolean {
	if (!dateStr) return false;
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) && parsed < new Date();
}

function StatusBadge({ status }: { status: string }) {
	const normalized = status?.toLowerCase();
	const styles: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
		confirmed: { label: 'Confirmed', className: 'dc-badge-success', icon: <CheckCircle className="h-3 w-3" /> },
		booked: { label: 'Confirmed', className: 'dc-badge-success', icon: <CheckCircle className="h-3 w-3" /> },
		pending: { label: 'Pending', className: 'dc-badge-warning', icon: <Clock className="h-3 w-3" /> },
		reserved: { label: 'Pending', className: 'dc-badge-warning', icon: <Clock className="h-3 w-3" /> },
		cancelled: { label: 'Cancelled', className: 'dc-badge-destructive', icon: <XCircle className="h-3 w-3" /> },
	};
	const style = styles[normalized] ?? { label: status || 'Unknown', className: 'bg-muted text-muted-foreground', icon: null };
	return (
		<span className={cn('dc-badge', style.className)}>
			{style.icon}
			{style.label}
		</span>
	);
}

export default function DashboardPage() {
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats>({
		totalBookings: 0,
		upcomingTrips: 0,
		totalRewards: 0,
		totalSpent: 0,
		completionRate: 0,
	});
	const [recentBookings, setRecentBookings] = useState<FlightBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadDashboard() {
			try {
				const [bookingsData, rewardsData] = await Promise.all([getFlightBookings(), getRewardsData()]);

				const bookings = bookingsData.success ? bookingsData.data : [];
				setRecentBookings(bookings.slice(0, 5));

				const upcoming = bookings.filter((b) => isUpcoming(b.departureDate)).length;
				const past = bookings.filter((b) => isPast(b.departureDate)).length;
				const totalSpent = bookings.reduce((sum, b) => sum + (b.payable_amount || b.amount || 0), 0);

				setStats({
					totalBookings: bookings.length,
					upcomingTrips: upcoming,
					totalRewards: rewardsData.data?.total_referral_reward ?? 0,
					totalSpent: totalSpent,
					completionRate: bookings.length > 0 ? (past / bookings.length) * 100 : 0,
				});
			} catch {
				// Keep empty defaults
			} finally {
				setIsLoading(false);
			}
		}

		loadDashboard();
	}, []);

	const displayName = user?.firstName || user?.name || 'Traveler';
	const currentDate = new Date();
	const greeting = currentDate.getHours() < 12 ? 'Good Morning' : currentDate.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

	const statCards = [
		{
			title: 'Total Bookings',
			value: String(stats.totalBookings),
			sub: 'All time',
			icon: Calendar,
			chip: 'bg-primary-light text-primary dark:bg-primary/15',
		},
		{
			title: 'Upcoming Trips',
			value: String(stats.upcomingTrips),
			sub: 'Scheduled',
			icon: CheckCircle,
			chip: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15',
		},
		{
			title: 'Rewards Points',
			value: stats.totalRewards.toLocaleString(),
			sub: 'Points earned',
			icon: Gift,
			chip: 'bg-amber-50 text-amber-500 dark:bg-amber-500/15',
		},
		{
			title: 'Total Spent',
			value: `₦${stats.totalSpent.toLocaleString()}`,
			sub: stats.completionRate > 0 ? `${Math.round(stats.completionRate)}% completed` : 'No trips yet',
			icon: CreditCard,
			chip: 'bg-blue-50 text-blue-500 dark:bg-blue-500/15',
		},
	];

	const quickActions = [
		{
			icon: Search,
			label: 'Search Flights',
			description: 'Your next adventure awaits',
			href: '/dashboard/search',
			chip: 'bg-primary-light text-primary dark:bg-primary/15',
		},
		{
			icon: Calendar,
			label: 'My Bookings',
			description: 'Manage your trips',
			href: '/dashboard/bookings',
			chip: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15',
		},
		{
			icon: Gift,
			label: 'Rewards',
			description: 'View your points',
			href: '/dashboard/rewards',
			chip: 'bg-amber-50 text-amber-500 dark:bg-amber-500/15',
		},
	];

	return (
		<div className="space-y-7 animate-fade-in">
			{/* Welcome */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
					{greeting}, {displayName}
				</h1>
				<p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock className="h-3.5 w-3.5" />
					{currentDate.toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					})}
				</p>
			</div>

			{/* Stat cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => (
					<div
						key={stat.title}
						className="dc-card flex items-start justify-between gap-3 p-5 transition-shadow hover:shadow-md">
						<div>
							<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{stat.title}</p>
							<p className="mt-1.5 text-2xl font-bold tracking-tight">{stat.value}</p>
							<p className="mt-1.5 text-[11px] text-muted-foreground">{stat.sub}</p>
						</div>
						<div className={cn('dc-icon-chip h-10 w-10', stat.chip)}>
							<stat.icon className="h-4.5 w-4.5" />
						</div>
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Quick Actions</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Your most used features</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{quickActions.map((action) => (
						<Link
							key={action.label}
							href={action.href}
							className="dc-card group flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md">
							<div className="flex min-w-0 items-center gap-3">
								<div className={cn('dc-icon-chip h-10 w-10', action.chip)}>
									<action.icon className="h-4.5 w-4.5" />
								</div>
								<div className="min-w-0">
									<h3 className="truncate text-sm font-semibold">{action.label}</h3>
									<p className="truncate text-xs text-muted-foreground">{action.description}</p>
								</div>
							</div>
							<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--dc-border)] text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white">
								<ArrowRight className="h-3.5 w-3.5" />
							</span>
						</Link>
					))}
				</div>
			</div>

			{/* Recent Bookings table */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Recent Bookings</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Your latest flight reservations</p>
				</div>

				<div className="dc-card overflow-hidden">
					{isLoading ? (
						<div className="flex justify-center py-14">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						</div>
					) : recentBookings.length === 0 ? (
						<div className="p-10 text-center">
							<div className="dc-icon-chip mx-auto mb-4 h-14 w-14 bg-primary-light dark:bg-primary/15">
								<Plane className="h-6 w-6 text-primary" />
							</div>
							<p className="font-semibold">No bookings yet</p>
							<p className="mt-1 text-sm text-muted-foreground">Start exploring destinations</p>
							<Button
								href="/dashboard/search"
								className="mt-5">
								<Plane className="h-4 w-4" />
								Book your first flight
							</Button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="dc-table">
								<thead>
									<tr>
										<th>Booking ID</th>
										<th>Departure</th>
										<th>Destination</th>
										<th>Passengers</th>
										<th>Date</th>
										<th>Status</th>
										<th aria-label="Actions" />
									</tr>
								</thead>
								<tbody>
									{recentBookings.map((booking) => (
										<tr key={booking.id || booking.reference}>
											<td className="font-mono text-xs font-medium">{booking.reference}</td>
											<td>
												<span className="font-medium">{booking.fromCode || booking.from}</span>
											</td>
											<td>
												<span className="font-medium">{booking.toCode || booking.to}</span>
											</td>
											<td className="text-muted-foreground">{booking.passengers?.length || 1} {booking.passengers?.length === 1 ? 'Adult, 0 Child' : 'Adults'}</td>
											<td className="text-muted-foreground">{formatBookingDate(booking.departureDate)}</td>
											<td>
												<StatusBadge status={booking.status} />
											</td>
											<td className="text-right">
												<Button
													href={`/dashboard/bookings/${booking.reference}`}
													variant="ghost"
													size="sm"
													className="rounded-lg hover:bg-primary/10 hover:text-primary">
													Details
													<ChevronRight className="ml-1 h-3.5 w-3.5" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Navy CTA band */}
			<div className="dc-cta relative overflow-hidden p-6 sm:p-7">
				<div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h3 className="text-lg font-bold">Ready for your next adventure?</h3>
						<p className="mt-1 text-sm text-[var(--ink-muted)]">See personalised flight deals, tailored for you (only)</p>
					</div>
					<Button
						href="/dashboard/search"
						variant="white"
						size="default"
						className="shrink-0">
						Book Now
					</Button>
				</div>
			</div>
		</div>
	);
}
