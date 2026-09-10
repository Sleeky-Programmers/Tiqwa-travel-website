'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { AdminStats } from '@/components/admin/AdminStats';
import { BookingTable } from '@/components/admin/BookingTable';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { Link } from '@/components/ui/Link';
import { getFlightBookings } from '@/services/whitelabel-api';

import type { FlightBooking } from '@/services/whitelabel-api';

interface DashboardStats {
	totalBookings: number;
	totalCustomers: number;
	totalRevenue: number;
	pendingBookings: number;
}

export default function AdminDashboardPage() {
	const [bookings, setBookings] = useState<FlightBooking[]>([]);
	const [stats, setStats] = useState<DashboardStats>({
		totalBookings: 0,
		totalCustomers: 0,
		totalRevenue: 0,
		pendingBookings: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadDashboardData() {
			setIsLoading(true);
			try {
				const result = await getFlightBookings();
				if (result.success) {
					const data = result.data;
					setBookings(data);

					// Calculate stats
					const totalBookings = data.length;
					const pendingBookings = data.filter((b) => b.status === 'PENDING' || b.status === 'RESERVED').length;
					const totalRevenue = data.reduce((sum, b) => sum + (b.payable_amount || b.amount || 0), 0);

					// Count unique customers
					const uniqueCustomers = new Set(data.map((b) => b.user_id)).size;

					setStats({
						totalBookings,
						totalCustomers: uniqueCustomers,
						totalRevenue,
						pendingBookings,
					});
				}
			} catch (error) {
				console.error('Failed to load dashboard data:', error);
			} finally {
				setIsLoading(false);
			}
		}

		loadDashboardData();
	}, []);

	const recentBookings = bookings.slice(0, 5);

	// Convert FlightBooking to AdminBooking format for the table
	const adminBookings = recentBookings.map((b) => ({
		id: parseInt(b.id) || 0,
		reference: b.reference,
		customer: b.passengers?.[0]?.first_name ? `${b.passengers[0].first_name} ${b.passengers[0].last_name}` : 'Unknown',
		email: b.passengers?.[0]?.email || '',
		amount: b.payable_amount || b.amount || 0,
		status: b.status === 'BOOKED' ? 'PAID' : b.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING_PAYMENT',
		booking_date: b.booking_date || b.created_at || '',
		route: `${b.from} → ${b.to}`,
		airline: b.outbound?.[0]?.airline || '',
		passengers: b.passengers?.length || 1,
	}));

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-6">
			<div className="dashboard-page-header">
				<h1 className="dashboard-title">Dashboard</h1>
				<p className="dashboard-subtitle">Overview of bookings, customers, and revenue</p>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : (
				<>
					<AdminStats
						stats={{
							totalBookings: stats.totalBookings,
							totalCustomers: stats.totalCustomers,
							totalRevenue: stats.totalRevenue,
							pendingBookings: stats.pendingBookings,
						}}
					/>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-4 lg:col-span-2">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Recent Bookings</h2>
								<Link href="/admin/bookings" className="text-sm">
									View all
								</Link>
							</div>
							<BookingTable />
						</div>

						<div className="lg:col-span-1">
							<RecentActivity activities={[]} />
						</div>
					</div>
				</>
			)}
		</motion.div>
	);
}
