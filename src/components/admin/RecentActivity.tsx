'use client';

import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface RecentActivityItem {
	id: number;
	description: string;
	performed_by: string;
	human_time: string;
}

interface RecentActivityProps {
	activities: RecentActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
	// If no activities, show a placeholder
	if (!activities || activities.length === 0) {
		return (
			<div className="glossy-card p-6">
				<div className="mb-4 flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					<h2 className="text-lg font-semibold">Recent Activity</h2>
				</div>
				<div className="py-8 text-center">
					<p className="text-sm text-muted-foreground">No recent activity</p>
				</div>
			</div>
		);
	}

	return (
		<div className="glossy-card p-6">
			<div className="mb-4 flex items-center gap-2">
				<Activity className="h-5 w-5 text-primary" />
				<h2 className="text-lg font-semibold">Recent Activity</h2>
			</div>

			<div className="space-y-4">
				{activities.map((activity, index) => (
					<motion.div
						key={activity.id}
						initial={{ opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.25, delay: index * 0.04 }}
						className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
						<div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
						<div className="min-w-0 flex-1">
							<p className="text-sm">{activity.description}</p>
							<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
								<span>{activity.performed_by}</span>
								<span>·</span>
								<span>{activity.human_time}</span>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
