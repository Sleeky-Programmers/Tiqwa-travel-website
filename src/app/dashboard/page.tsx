'use client';

import { format, isValid, parseISO } from 'date-fns';
import { ArrowRight, Award, Calendar, ChevronRight, Clock, CreditCard, Gift, MapPin, Plane, Search, Sparkles, Star, TrendingDown, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Link as UiLink } from '@/components/ui/Link';
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
	return isValid(parsed) ? format(parsed, 'PPP') : dateStr;
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

const statusColors: Record<string, string> = {
	confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
	pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
	cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
	default: 'bg-secondary text-foreground/70 border-border',
};

function getStatusClass(status: string): string {
	return statusColors[status?.toLowerCase()] ?? statusColors.default;
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
				setRecentBookings(bookings.slice(0, 3));

				const upcoming = bookings.filter((b) => isUpcoming(b.departureDate)).length;
				const past = bookings.filter((b) => isPast(b.departureDate)).length;
				const totalSpent = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

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
			value: stats.totalBookings,
			icon: Calendar,
			gradient: 'from-blue-500 to-blue-400',
			bg: 'bg-blue-50 dark:bg-blue-900/20',
			color: 'text-blue-500',
			trend: 'All time',
		},
		{
			title: 'Upcoming Trips',
			value: stats.upcomingTrips,
			icon: Plane,
			gradient: 'from-emerald-500 to-emerald-400',
			bg: 'bg-emerald-50 dark:bg-emerald-900/20',
			color: 'text-emerald-500',
			trend: 'Scheduled',
		},
		{
			title: 'Rewards Points',
			value: stats.totalRewards.toLocaleString(),
			icon: Award,
			gradient: 'from-amber-500 to-amber-400',
			bg: 'bg-amber-50 dark:bg-amber-900/20',
			color: 'text-amber-500',
			trend: 'Points earned',
		},
		{
			title: 'Total Spent',
			value: `₦${stats.totalSpent.toLocaleString()}`,
			icon: CreditCard,
			gradient: 'from-purple-500 to-purple-400',
			bg: 'bg-purple-50 dark:bg-purple-900/20',
			color: 'text-purple-500',
			trend: stats.completionRate > 0 ? `${Math.round(stats.completionRate)}% completed` : 'No trips yet',
		},
	];

	const quickActions = [
		{
			icon: Search,
			label: 'Search Flights',
			description: 'Find the best deals',
			href: '/dashboard/search',
			color: 'from-blue-500 to-blue-600',
		},
		{
			icon: Calendar,
			label: 'My Bookings',
			description: 'Manage your trips',
			href: '/dashboard/bookings',
			color: 'from-emerald-500 to-emerald-600',
		},
		{
			icon: Gift,
			label: 'Rewards',
			description: 'View your points',
			href: '/dashboard/rewards',
			color: 'from-amber-500 to-amber-600',
		},
	];

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Welcome Section */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						{greeting}, {displayName} <span className="text-primary">👋</span>
					</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<Clock className="h-4 w-4" />
						{currentDate.toLocaleDateString('en-US', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</p>
				</div>
				<Button href="/dashboard/search" shape="pill" className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-105">
					<Plane className="mr-2 h-4 w-4" />
					Book a Flight
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => (
					<div
						key={stat.title}
						className="card-premium group relative overflow-hidden p-5 hover:scale-[1.02] dark:hover:shadow-2xl">
						<div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

						<div className="flex items-start justify-between relative z-10">
							<div>
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
								<p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
								<div className="mt-2 flex items-center gap-1.5">
									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
									<span className="text-xs font-medium text-muted-foreground">{stat.trend}</span>
								</div>
							</div>
							<div className={cn('rounded-2xl p-3 transition-all group-hover:scale-110 group-hover:shadow-lg', stat.bg)}>
								<stat.icon className={cn('h-5 w-5', stat.color)} />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">Quick Actions</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Your most used features</p>
					</div>
					<UiLink href="/dashboard/search" className="flex items-center gap-1">
						View all <ChevronRight className="h-4 w-4" />
					</UiLink>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{quickActions.map((action, index) => (
						<Link
							key={index}
							href={action.href}
							className="card-premium group relative overflow-hidden p-5 hover:scale-[1.02] dark:hover:shadow-2xl">
							<div className="flex items-start gap-4">
								<div className={cn('rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl', action.color)}>
									<action.icon className="h-5 w-5" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold">{action.label}</h3>
									<p className="text-sm text-muted-foreground">{action.description}</p>
								</div>
								<ArrowRight className="h-5 w-5 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary" />
							</div>
							<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
						</Link>
					))}
				</div>
			</div>

			{/* Recent Bookings */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">Recent Bookings</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Your latest flight reservations</p>
					</div>
					<UiLink href="/dashboard/bookings" className="flex items-center gap-1">
						View all <ChevronRight className="h-4 w-4" />
					</UiLink>
				</div>

				<div className="space-y-3">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						</div>
					) : recentBookings.length === 0 ? (
						<div className="card-premium relative overflow-hidden p-8 text-center">
							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8">
								<Plane className="h-6 w-6 text-primary/60" />
							</div>
							<p className="font-semibold text-base">No bookings yet</p>
							<p className="mt-1 text-sm text-muted-foreground">Start exploring destinations</p>
							<Button
								href="/dashboard/search"
								shape="pill"
								className="mt-4 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-105">
								<Plane className="h-4 w-4" />
								Book your first flight
							</Button>
						</div>
					) : (
						recentBookings.map((booking) => (
							<div
								key={booking.id || booking.reference}
								className="card-premium group relative overflow-hidden p-4 hover:scale-[1.01] dark:hover:shadow-2xl">
								<div className="flex flex-wrap items-center justify-between gap-4">
									<div className="flex items-center gap-4">
										<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
											<Plane className="h-5 w-5" />
										</div>
										<div>
											<div className="flex items-center gap-2 font-semibold">
												<span>{booking.from}</span>
												<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
												<span>{booking.to}</span>
											</div>
											<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{formatBookingDate(booking.departureDate)}
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-3 ml-auto">
										<div className="text-right">
											<p className="font-bold text-primary">{formatFlightPrice(booking.amount, booking.currency)}</p>
										</div>
										<span className={cn('rounded-full border px-3 py-1 text-xs font-medium capitalize', getStatusClass(booking.status))}>{booking.status}</span>
										<Button
											href={`/dashboard/bookings/${booking.reference}`}
											size="sm"
											variant="ghost"
											className="rounded-xl hover:bg-primary/10 hover:text-primary">
											Details
											<ChevronRight className="ml-1 h-3.5 w-3.5" />
										</Button>
									</div>
								</div>
								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						))
					)}
				</div>
			</div>

			{/* CTA Card */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-7 backdrop-blur-xl dark:from-primary/20">
				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

				<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
							<Sparkles className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 className="text-lg font-bold">Ready for your next adventure?</h3>
							<p className="text-sm text-muted-foreground">Search and book flights instantly — best prices guaranteed</p>
						</div>
					</div>
					<Button
						href="/dashboard/search"
						size="lg"
						shape="pill"
						className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105">
						<Plane className="mr-2 h-4 w-4" />
						Book Now
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

// 'use client';

// import { format, isValid, parseISO } from 'date-fns';
// import { ArrowRight, Award, Calendar, ChevronRight, Clock, CreditCard, Gift, MapPin, Plane, Search, Sparkles, Star, TrendingDown, TrendingUp, Users } from 'lucide-react';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';

// import { PageTransition } from '@/components/layout/PageTransition';
// import { Button } from '@/components/ui/Button';
// import { Card } from '@/components/ui/Card';
// import { Heading, Text } from '@/components/ui/Typography';
// import { useAuth } from '@/contexts/AuthContext';
// import { cn } from '@/lib/utils';
// import { FlightBooking, formatFlightPrice, getFlightBookings, getRewardsData } from '@/services/whitelabel-api';

// interface DashboardStats {
// 	totalBookings: number;
// 	upcomingTrips: number;
// 	totalRewards: number;
// 	totalSpent: number;
// 	completionRate: number;
// }

// function formatBookingDate(dateStr: string): string {
// 	if (!dateStr) return '—';
// 	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
// 	return isValid(parsed) ? format(parsed, 'PPP') : dateStr;
// }

// function isUpcoming(dateStr: string): boolean {
// 	if (!dateStr) return false;
// 	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
// 	return isValid(parsed) && parsed > new Date();
// }

// function isPast(dateStr: string): boolean {
// 	if (!dateStr) return false;
// 	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
// 	return isValid(parsed) && parsed < new Date();
// }

// const statusColors: Record<string, string> = {
// 	confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
// 	pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
// 	cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
// 	default: 'bg-secondary text-foreground/70 border-border',
// };

// function getStatusClass(status: string): string {
// 	return statusColors[status?.toLowerCase()] ?? statusColors.default;
// }

// export default function DashboardPage() {
// 	const { user } = useAuth();
// 	const [stats, setStats] = useState<DashboardStats>({
// 		totalBookings: 0,
// 		upcomingTrips: 0,
// 		totalRewards: 0,
// 		totalSpent: 0,
// 		completionRate: 0,
// 	});
// 	const [recentBookings, setRecentBookings] = useState<FlightBooking[]>([]);
// 	const [isLoading, setIsLoading] = useState(true);

// 	useEffect(() => {
// 		async function loadDashboard() {
// 			try {
// 				const [bookingsData, rewardsData] = await Promise.all([getFlightBookings(), getRewardsData()]);

// 				const bookings = bookingsData.success ? bookingsData.data : [];
// 				setRecentBookings(bookings.slice(0, 3));

// 				const upcoming = bookings.filter((b) => isUpcoming(b.departureDate)).length;
// 				const past = bookings.filter((b) => isPast(b.departureDate)).length;
// 				const totalSpent = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

// 				setStats({
// 					totalBookings: bookings.length,
// 					upcomingTrips: upcoming,
// 					totalRewards: rewardsData.data?.total_referral_reward ?? 0,
// 					totalSpent: totalSpent,
// 					completionRate: bookings.length > 0 ? (past / bookings.length) * 100 : 0,
// 				});
// 			} catch {
// 				// Keep empty defaults
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		}

// 		loadDashboard();
// 	}, []);

// 	const displayName = user?.firstName || user?.name || 'Traveler';
// 	const currentDate = new Date();
// 	const greeting = currentDate.getHours() < 12 ? 'Good Morning' : currentDate.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

// 	const statCards = [
// 		{
// 			title: 'Total Bookings',
// 			value: stats.totalBookings,
// 			icon: Calendar,
// 			gradient: 'from-blue-500 to-blue-400',
// 			bg: 'bg-blue-50 dark:bg-blue-900/20',
// 			color: 'text-blue-500',
// 			trend: 'All time',
// 		},
// 		{
// 			title: 'Upcoming Trips',
// 			value: stats.upcomingTrips,
// 			icon: Plane,
// 			gradient: 'from-emerald-500 to-emerald-400',
// 			bg: 'bg-emerald-50 dark:bg-emerald-900/20',
// 			color: 'text-emerald-500',
// 			trend: 'Scheduled',
// 		},
// 		{
// 			title: 'Rewards Points',
// 			value: stats.totalRewards.toLocaleString(),
// 			icon: Award,
// 			gradient: 'from-amber-500 to-amber-400',
// 			bg: 'bg-amber-50 dark:bg-amber-900/20',
// 			color: 'text-amber-500',
// 			trend: 'Points earned',
// 		},
// 		{
// 			title: 'Total Spent',
// 			value: `₦${stats.totalSpent.toLocaleString()}`,
// 			icon: CreditCard,
// 			gradient: 'from-purple-500 to-purple-400',
// 			bg: 'bg-purple-50 dark:bg-purple-900/20',
// 			color: 'text-purple-500',
// 			trend: stats.completionRate > 0 ? `${Math.round(stats.completionRate)}% completed` : 'No trips yet',
// 		},
// 	];

// 	const quickActions = [
// 		{
// 			icon: Search,
// 			label: 'Search Flights',
// 			description: 'Find the best deals',
// 			href: '/dashboard/search',
// 			color: 'from-blue-500 to-blue-600',
// 		},
// 		{
// 			icon: Calendar,
// 			label: 'My Bookings',
// 			description: 'Manage your trips',
// 			href: '/dashboard/bookings',
// 			color: 'from-emerald-500 to-emerald-600',
// 		},
// 		{
// 			icon: Gift,
// 			label: 'Rewards',
// 			description: 'View your points',
// 			href: '/dashboard/rewards',
// 			color: 'from-amber-500 to-amber-600',
// 		},
// 	];

// 	return (
// 		<PageTransition className="space-y-8">
// 			{/* Welcome Section with Gradient Accent */}
// 			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// 				<div>
// 					<Heading level="h1">
// 						{greeting}, {displayName} <span className="gradient-text-primary">👋</span>
// 					</Heading>
// 					<Text
// 						variant="muted"
// 						className="flex items-center gap-2">
// 						<Clock className="h-4 w-4" />
// 						{currentDate.toLocaleDateString('en-US', {
// 							weekday: 'long',
// 							year: 'numeric',
// 							month: 'long',
// 							day: 'numeric',
// 						})}
// 					</Text>
// 				</div>
// 				<Link href="/dashboard/search">
// 					<Button className="rounded-full shadow-primary hover:shadow-primary/40 transition-all hover:scale-105">
// 						<Plane className="mr-2 h-4 w-4" />
// 						Book a Flight
// 						<ArrowRight className="ml-2 h-4 w-4" />
// 					</Button>
// 				</Link>
// 			</div>

// 			{/* Stats Grid with Premium Cards */}
// 			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
// 				{statCards.map((stat, index) => (
// 					<Card
// 						key={stat.title}
// 						variant="elevated"
// 						className="relative overflow-hidden group">
// 						<div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

// 						<div className="flex items-start justify-between relative z-10">
// 							<div>
// 								<Text
// 									variant="small"
// 									className="text-muted-foreground uppercase tracking-wider">
// 									{stat.title}
// 								</Text>
// 								<Heading
// 									level="h3"
// 									className="mt-1">
// 									{stat.value}
// 								</Heading>
// 								<div className="mt-2 flex items-center gap-1.5">
// 									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
// 									<Text
// 										variant="small"
// 										className="text-muted-foreground">
// 										{stat.trend}
// 									</Text>
// 								</div>
// 							</div>
// 							<div className={cn('rounded-2xl p-3 transition-all group-hover:scale-110 group-hover:shadow-lg', stat.bg)}>
// 								<stat.icon className={cn('h-5 w-5', stat.color)} />
// 							</div>
// 						</div>
// 					</Card>
// 				))}
// 			</div>

// 			<div>
// 				<div className="mb-4 flex items-center justify-between">
// 					<div>
// 						<h2 className="text-base font-semibold">Quick Actions</h2>
// 						<p className="text-xs text-muted-foreground mt-0.5">Your most used features</p>
// 					</div>
// 					<Link
// 						href="/dashboard/search"
// 						className="text-sm text-primary hover:underline flex items-center gap-1">
// 						View all <ChevronRight className="h-4 w-4" />
// 					</Link>
// 				</div>
// 				<div className="grid gap-4 sm:grid-cols-3">
// 					{quickActions.map((action, index) => (
// 						<Link
// 							key={index}
// 							href={action.href}
// 							className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
// 							<div className="flex items-start gap-4">
// 								<div className={cn('rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl', action.color)}>
// 									<action.icon className="h-5 w-5" />
// 								</div>
// 								<div className="flex-1">
// 									<h3 className="font-semibold">{action.label}</h3>
// 									<p className="text-sm text-muted-foreground">{action.description}</p>
// 								</div>
// 								<ArrowRight className="h-5 w-5 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary" />
// 							</div>
// 							<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
// 						</Link>
// 					))}
// 				</div>
// 			</div>

// 			{/* Recent Bookings - Light mode: solid white with shadow, Dark mode: glass */}
// 			<div>
// 				<div className="mb-4 flex items-center justify-between">
// 					<div>
// 						<h2 className="text-base font-semibold">Recent Bookings</h2>
// 						<p className="text-xs text-muted-foreground mt-0.5">Your latest flight reservations</p>
// 					</div>
// 					<Link
// 						href="/dashboard/bookings"
// 						className="text-sm text-primary hover:underline flex items-center gap-1">
// 						View all <ChevronRight className="h-4 w-4" />
// 					</Link>
// 				</div>

// 				<div className="space-y-3">
// 					{isLoading ? (
// 						<div className="flex justify-center py-12">
// 							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
// 						</div>
// 					) : recentBookings.length === 0 ? (
// 						<div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
// 							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8">
// 								<Plane className="h-6 w-6 text-primary/60" />
// 							</div>
// 							<p className="font-semibold text-base">No bookings yet</p>
// 							<p className="mt-1 text-sm text-muted-foreground">Start exploring destinations</p>
// 							<Link
// 								href="/dashboard/search"
// 								className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-105">
// 								<Plane className="h-4 w-4" />
// 								Book your first flight
// 							</Link>
// 						</div>
// 					) : (
// 						recentBookings.map((booking) => (
// 							<div
// 								key={booking.id || booking.reference}
// 								className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
// 								<div className="flex flex-wrap items-center justify-between gap-4">
// 									{/* Route */}
// 									<div className="flex items-center gap-4">
// 										<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
// 											<Plane className="h-5 w-5" />
// 										</div>
// 										<div>
// 											<div className="flex items-center gap-2 font-semibold">
// 												<span>{booking.from}</span>
// 												<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
// 												<span>{booking.to}</span>
// 											</div>
// 											<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
// 												<span className="flex items-center gap-1">
// 													<Calendar className="h-3 w-3" />
// 													{formatBookingDate(booking.departureDate)}
// 												</span>
// 											</div>
// 										</div>
// 									</div>

// 									{/* Status & Price */}
// 									<div className="flex items-center gap-3 ml-auto">
// 										<div className="text-right">
// 											<p className="font-bold text-primary">{formatFlightPrice(booking.amount, booking.currency)}</p>
// 										</div>
// 										<span className={cn('rounded-full border px-3 py-1 text-xs font-medium capitalize', getStatusClass(booking.status))}>{booking.status}</span>
// 										<Button
// 											size="sm"
// 											variant="ghost"
// 											className="rounded-xl hover:bg-primary/10 hover:text-primary">
// 											Details
// 											<ChevronRight className="ml-1 h-3.5 w-3.5" />
// 										</Button>
// 									</div>
// 								</div>
// 								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
// 							</div>
// 						))
// 					)}
// 				</div>
// 			</div>

// 			{/* CTA Card - Light mode: gradient with solid bg, Dark mode: gradient with glass */}
// 			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-7 backdrop-blur-xl dark:from-primary/20">
// 				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
// 				<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

// 				<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
// 					<div className="flex items-start gap-4">
// 						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
// 							<Sparkles className="h-6 w-6 text-primary" />
// 						</div>
// 						<div>
// 							<h3 className="text-lg font-bold">Ready for your next adventure?</h3>
// 							<p className="text-sm text-muted-foreground">Search and book flights instantly — best prices guaranteed</p>
// 						</div>
// 					</div>
// 					<Link href="/dashboard/search">
// 						<Button
// 							size="lg"
// 							className="rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105">
// 							<Plane className="mr-2 h-4 w-4" />
// 							Book Now
// 							<ArrowRight className="ml-2 h-4 w-4" />
// 						</Button>
// 					</Link>
// 				</div>
// 			</div>
// 		</PageTransition>
// 	);
// }

// 'use client';

// import { format, isValid, parseISO } from 'date-fns';
// import { ArrowRight, Award, Calendar, ChevronRight, Clock, CreditCard, Gift, MapPin, Plane, Search, Sparkles, Star, TrendingDown, TrendingUp, Users } from 'lucide-react';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';

// import { Button } from '@/components/ui/Button';
// import { useAuth } from '@/contexts/AuthContext';
// import { cn } from '@/lib/utils';
// import { FlightBooking, formatFlightPrice, getFlightBookings, getRewardsData } from '@/services/whitelabel-api';

// interface DashboardStats {
// 	totalBookings: number;
// 	upcomingTrips: number;
// 	totalRewards: number;
// 	totalSpent: number;
// 	completionRate: number;
// }

// function formatBookingDate(dateStr: string): string {
// 	if (!dateStr) return '—';
// 	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
// 	return isValid(parsed) ? format(parsed, 'PPP') : dateStr;
// }

// function isUpcoming(dateStr: string): boolean {
// 	if (!dateStr) return false;
// 	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
// 	return isValid(parsed) && parsed > new Date();
// }

// function isPast(dateStr: string): boolean {
// 	if (!dateStr) return false;
// 	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
// 	return isValid(parsed) && parsed < new Date();
// }

// const statusColors: Record<string, string> = {
// 	confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
// 	pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
// 	cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
// 	default: 'bg-secondary text-foreground/70 border-border',
// };

// function getStatusClass(status: string): string {
// 	return statusColors[status?.toLowerCase()] ?? statusColors.default;
// }

// export default function DashboardPage() {
// 	const { user } = useAuth();
// 	const [stats, setStats] = useState<DashboardStats>({
// 		totalBookings: 0,
// 		upcomingTrips: 0,
// 		totalRewards: 0,
// 		totalSpent: 0,
// 		completionRate: 0,
// 	});
// 	const [recentBookings, setRecentBookings] = useState<FlightBooking[]>([]);
// 	const [isLoading, setIsLoading] = useState(true);

// 	useEffect(() => {
// 		async function loadDashboard() {
// 			try {
// 				const [bookingsData, rewardsData] = await Promise.all([getFlightBookings(), getRewardsData()]);

// 				const bookings = bookingsData.success ? bookingsData.data : [];
// 				setRecentBookings(bookings.slice(0, 3));

// 				const upcoming = bookings.filter((b) => isUpcoming(b.departureDate)).length;
// 				const past = bookings.filter((b) => isPast(b.departureDate)).length;
// 				const totalSpent = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

// 				setStats({
// 					totalBookings: bookings.length,
// 					upcomingTrips: upcoming,
// 					totalRewards: rewardsData.data?.total_referral_reward ?? 0,
// 					totalSpent: totalSpent,
// 					completionRate: bookings.length > 0 ? (past / bookings.length) * 100 : 0,
// 				});
// 			} catch {
// 				// Keep empty defaults
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		}

// 		loadDashboard();
// 	}, []);

// 	const displayName = user?.firstName || user?.name || 'Traveler';
// 	const currentDate = new Date();
// 	const greeting = currentDate.getHours() < 12 ? 'Good Morning' : currentDate.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

// 	const statCards = [
// 		{
// 			title: 'Total Bookings',
// 			value: stats.totalBookings,
// 			icon: Calendar,
// 			gradient: 'from-blue-500 to-blue-400',
// 			bg: 'bg-blue-50 dark:bg-blue-900/20',
// 			color: 'text-blue-500',
// 			trend: 'All time',
// 		},
// 		{
// 			title: 'Upcoming Trips',
// 			value: stats.upcomingTrips,
// 			icon: Plane,
// 			gradient: 'from-emerald-500 to-emerald-400',
// 			bg: 'bg-emerald-50 dark:bg-emerald-900/20',
// 			color: 'text-emerald-500',
// 			trend: 'Scheduled',
// 		},
// 		{
// 			title: 'Rewards Points',
// 			value: stats.totalRewards.toLocaleString(),
// 			icon: Award,
// 			gradient: 'from-amber-500 to-amber-400',
// 			bg: 'bg-amber-50 dark:bg-amber-900/20',
// 			color: 'text-amber-500',
// 			trend: 'Points earned',
// 		},
// 		{
// 			title: 'Total Spent',
// 			value: `₦${stats.totalSpent.toLocaleString()}`,
// 			icon: CreditCard,
// 			gradient: 'from-purple-500 to-purple-400',
// 			bg: 'bg-purple-50 dark:bg-purple-900/20',
// 			color: 'text-purple-500',
// 			trend: stats.completionRate > 0 ? `${Math.round(stats.completionRate)}% completed` : 'No trips yet',
// 		},
// 	];

// 	const quickActions = [
// 		{
// 			icon: Search,
// 			label: 'Search Flights',
// 			description: 'Find the best deals',
// 			href: '/dashboard/search',
// 			color: 'from-blue-500 to-blue-600',
// 		},
// 		{
// 			icon: Calendar,
// 			label: 'My Bookings',
// 			description: 'Manage your trips',
// 			href: '/dashboard/bookings',
// 			color: 'from-emerald-500 to-emerald-600',
// 		},
// 		{
// 			icon: Gift,
// 			label: 'Rewards',
// 			description: 'View your points',
// 			href: '/dashboard/rewards',
// 			color: 'from-amber-500 to-amber-600',
// 		},
// 	];

// 	return (
// 		<div className="space-y-7 page-transition">
// 			{/* Welcome Section */}
// 			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// 				<div className="space-y-1.5">
// 					<div className="flex items-center gap-3">
// 						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
// 							{greeting}, {displayName} 👋
// 						</h1>
// 						<div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
// 							<span className="relative flex h-2 w-2">
// 								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
// 								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
// 							</span>
// 							{stats.upcomingTrips > 0 ? `${stats.upcomingTrips} upcoming` : 'Ready to fly'}
// 						</div>
// 					</div>
// 					<p className="text-sm text-muted-foreground flex items-center gap-2">
// 						<Clock className="h-4 w-4" />
// 						{currentDate.toLocaleDateString('en-US', {
// 							weekday: 'long',
// 							year: 'numeric',
// 							month: 'long',
// 							day: 'numeric',
// 						})}
// 					</p>
// 				</div>
// 				<Link href="/dashboard/search">
// 					<Button
// 						size="default"
// 						className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-105">
// 						<Plane className="mr-2 h-4 w-4" />
// 						Book a Flight
// 						<ArrowRight className="ml-2 h-4 w-4" />
// 					</Button>
// 				</Link>
// 			</div>

// 			{/* Stats Grid - Light mode: solid white with shadow, Dark mode: glass */}
// 			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
// 				{statCards.map((stat) => (
// 					<div
// 						key={stat.title}
// 						className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
// 						<div className="flex items-start justify-between">
// 							<div className="space-y-1.5">
// 								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
// 								<p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
// 								<div className="flex items-center gap-1.5">
// 									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
// 									<span className="text-xs font-medium text-muted-foreground">{stat.trend}</span>
// 								</div>
// 							</div>
// 							<div className={cn('rounded-2xl p-3 transition-all group-hover:scale-110 group-hover:shadow-lg', stat.bg)}>
// 								<stat.icon className={cn('h-5 w-5', stat.color)} />
// 							</div>
// 						</div>
// 						<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
// 					</div>
// 				))}
// 			</div>

// 			{/* Quick Actions - Light mode: solid white with shadow, Dark mode: glass */}
// 			<div>
// 				<div className="mb-4 flex items-center justify-between">
// 					<div>
// 						<h2 className="text-base font-semibold">Quick Actions</h2>
// 						<p className="text-xs text-muted-foreground mt-0.5">Your most used features</p>
// 					</div>
// 					<Link
// 						href="/dashboard/search"
// 						className="text-sm text-primary hover:underline flex items-center gap-1">
// 						View all <ChevronRight className="h-4 w-4" />
// 					</Link>
// 				</div>
// 				<div className="grid gap-4 sm:grid-cols-3">
// 					{quickActions.map((action, index) => (
// 						<Link
// 							key={index}
// 							href={action.href}
// 							className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
// 							<div className="flex items-start gap-4">
// 								<div className={cn('rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl', action.color)}>
// 									<action.icon className="h-5 w-5" />
// 								</div>
// 								<div className="flex-1">
// 									<h3 className="font-semibold">{action.label}</h3>
// 									<p className="text-sm text-muted-foreground">{action.description}</p>
// 								</div>
// 								<ArrowRight className="h-5 w-5 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary" />
// 							</div>
// 							<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
// 						</Link>
// 					))}
// 				</div>
// 			</div>

// 			{/* Recent Bookings - Light mode: solid white with shadow, Dark mode: glass */}
// 			<div>
// 				<div className="mb-4 flex items-center justify-between">
// 					<div>
// 						<h2 className="text-base font-semibold">Recent Bookings</h2>
// 						<p className="text-xs text-muted-foreground mt-0.5">Your latest flight reservations</p>
// 					</div>
// 					<Link
// 						href="/dashboard/bookings"
// 						className="text-sm text-primary hover:underline flex items-center gap-1">
// 						View all <ChevronRight className="h-4 w-4" />
// 					</Link>
// 				</div>

// 				<div className="space-y-3">
// 					{isLoading ? (
// 						<div className="flex justify-center py-12">
// 							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
// 						</div>
// 					) : recentBookings.length === 0 ? (
// 						<div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
// 							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8">
// 								<Plane className="h-6 w-6 text-primary/60" />
// 							</div>
// 							<p className="font-semibold text-base">No bookings yet</p>
// 							<p className="mt-1 text-sm text-muted-foreground">Start exploring destinations</p>
// 							<Link
// 								href="/dashboard/search"
// 								className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:scale-105">
// 								<Plane className="h-4 w-4" />
// 								Book your first flight
// 							</Link>
// 						</div>
// 					) : (
// 						recentBookings.map((booking) => (
// 							<div
// 								key={booking.id || booking.reference}
// 								className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
// 								<div className="flex flex-wrap items-center justify-between gap-4">
// 									{/* Route */}
// 									<div className="flex items-center gap-4">
// 										<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
// 											<Plane className="h-5 w-5" />
// 										</div>
// 										<div>
// 											<div className="flex items-center gap-2 font-semibold">
// 												<span>{booking.from}</span>
// 												<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
// 												<span>{booking.to}</span>
// 											</div>
// 											<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
// 												<span className="flex items-center gap-1">
// 													<Calendar className="h-3 w-3" />
// 													{formatBookingDate(booking.departureDate)}
// 												</span>
// 											</div>
// 										</div>
// 									</div>

// 									{/* Status & Price */}
// 									<div className="flex items-center gap-3 ml-auto">
// 										<div className="text-right">
// 											<p className="font-bold text-primary">{formatFlightPrice(booking.amount, booking.currency)}</p>
// 										</div>
// 										<span className={cn('rounded-full border px-3 py-1 text-xs font-medium capitalize', getStatusClass(booking.status))}>{booking.status}</span>
// 										<Button
// 											size="sm"
// 											variant="ghost"
// 											className="rounded-xl hover:bg-primary/10 hover:text-primary">
// 											Details
// 											<ChevronRight className="ml-1 h-3.5 w-3.5" />
// 										</Button>
// 									</div>
// 								</div>
// 								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
// 							</div>
// 						))
// 					)}
// 				</div>
// 			</div>

// 			{/* CTA Card - Light mode: gradient with solid bg, Dark mode: gradient with glass */}
// 			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-7 backdrop-blur-xl dark:from-primary/20">
// 				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
// 				<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

// 				<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
// 					<div className="flex items-start gap-4">
// 						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
// 							<Sparkles className="h-6 w-6 text-primary" />
// 						</div>
// 						<div>
// 							<h3 className="text-lg font-bold">Ready for your next adventure?</h3>
// 							<p className="text-sm text-muted-foreground">Search and book flights instantly — best prices guaranteed</p>
// 						</div>
// 					</div>
// 					<Link href="/dashboard/search">
// 						<Button
// 							size="lg"
// 							className="rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105">
// 							<Plane className="mr-2 h-4 w-4" />
// 							Book Now
// 							<ArrowRight className="ml-2 h-4 w-4" />
// 						</Button>
// 					</Link>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
