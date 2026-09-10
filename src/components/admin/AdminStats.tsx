'use client';

import { Calendar, Clock, CreditCard, Users } from 'lucide-react';
import { motion } from 'motion/react';

import { formatNaira } from '@/data/admin-mock-data';

interface AdminStatsProps {
	stats: {
		totalBookings: number;
		totalCustomers: number;
		totalRevenue: number;
		pendingBookings: number;
	};
}

export function AdminStats({ stats }: AdminStatsProps) {
	const statCards = [
		{ label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), icon: Calendar },
		{ label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users },
		{ label: 'Total Revenue', value: formatNaira(stats.totalRevenue), icon: CreditCard },
		{ label: 'Pending Bookings', value: stats.pendingBookings.toLocaleString(), icon: Clock },
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{statCards.map((stat, index) => (
				<motion.div
					key={stat.label}
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: index * 0.05 }}
					className="glossy-card p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">{stat.label}</p>
							<p className="text-2xl font-bold">{stat.value}</p>
						</div>
						<div className="rounded-full bg-primary/10 p-3 text-primary">
							<stat.icon className="h-5 w-5" />
						</div>
					</div>
				</motion.div>
			))}
		</div>
	);
}
