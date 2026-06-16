'use client';

import { format, isValid, parseISO } from 'date-fns';
import { Award, Calendar, Plane } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { FlightBooking, formatFlightPrice, getFlightBookings, getRewardsData } from '@/services/whitelabel-api';

interface DashboardStats {
	totalBookings: number;
	upcomingTrips: number;
	totalRewards: number;
}

function formatBookingDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'PPP') : dateStr;
}

function isUpcoming(dateStr: string): boolean {
	if (!dateStr) return false;
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) && parsed > new Date();
}

export default function DashboardPage() {
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats>({
		totalBookings: 0,
		upcomingTrips: 0,
		totalRewards: 0,
	});
	const [recentBookings, setRecentBookings] = useState<FlightBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadDashboard() {
			try {
				const [bookingsData, rewardsData] = await Promise.all([getFlightBookings(), getRewardsData()]);

				const bookings = bookingsData.success ? bookingsData.data : [];
				setRecentBookings(bookings.slice(0, 3));

				const upcoming = bookings.filter((b) => isUpcoming(b.departureDate)).length;
				setStats({
					totalBookings: bookings.length,
					upcomingTrips: upcoming,
					totalRewards: rewardsData.data?.total_referral_reward ?? 0,
				});
			} catch {
				// Keep empty defaults
			} finally {
				setIsLoading(false);
			}
		}

		loadDashboard();
	}, []);

	const statCards = [
		{
			title: 'Total Bookings',
			value: stats.totalBookings,
			icon: Calendar,
			color: 'text-blue-500',
		},
		{
			title: 'Upcoming Trips',
			value: stats.upcomingTrips,
			icon: Plane,
			color: 'text-green-500',
		},
		{
			title: 'Rewards Points',
			value: stats.totalRewards,
			icon: Award,
			color: 'text-amber-500',
		},
	];

	return (
		<div className="dashboard-page space-y-6">
			<div className="dashboard-page-header">
				<h1 className="dashboard-title">Dashboard</h1>
				<p className="dashboard-subtitle">Welcome back, {user?.firstName || user?.name}!</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{statCards.map((stat) => (
					<Card
						key={stat.title}
						hover={false}
						className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">{stat.title}</p>
								<p className="text-2xl font-bold">{stat.value}</p>
							</div>
							<div className="dashboard-stat-icon">
								<stat.icon className={`h-5 w-5 ${stat.color}`} />
							</div>
						</div>
					</Card>
				))}
			</div>

			<Card
				hover={false}
				className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Recent Bookings</h2>
					<Link
						href="/dashboard/bookings"
						className="text-sm text-primary hover:underline">
						View all
					</Link>
				</div>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					</div>
				) : recentBookings.length === 0 ? (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No bookings yet</p>
						<Link
							href="/dashboard/search"
							className="mt-2 inline-block text-sm text-primary hover:underline">
							Book your first flight
						</Link>
					</div>
				) : (
					<div className="space-y-3">
						{recentBookings.map((booking) => (
							<div
								key={booking.id || booking.reference}
								className="flex items-center justify-between border-b border-border pb-3 last:border-0">
								<div>
									<p className="font-medium">
										{booking.from} → {booking.to}
									</p>
									<p className="text-sm text-muted-foreground">{formatBookingDate(booking.departureDate)}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-primary">{formatFlightPrice(booking.amount, booking.currency)}</p>
									<p className="text-xs capitalize text-muted-foreground">{booking.status}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			<Card
				hover={false}
				className="border-primary/20 bg-primary/5 p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className="font-semibold">Ready for your next adventure?</h3>
						<p className="text-sm text-muted-foreground">Search and book flights instantly</p>
					</div>
					<Link href="/search">
						<Button>Book Now</Button>
					</Link>
				</div>
			</Card>
		</div>
	);
}
