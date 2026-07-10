'use client';

import type { BookingStatus } from '@/data/admin-mock-data';
import { bookingStatusMap } from '@/data/admin-mock-data';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
	status: string;
	statusMap?: Record<string, { label: string; className: string }>;
}

export function StatusBadge({ status, statusMap = bookingStatusMap }: StatusBadgeProps) {
	const config = statusMap[status] ?? { label: status, className: 'bg-secondary text-muted-foreground' };

	return (
		<span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
			{config.label}
		</span>
	);
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
	return <StatusBadge status={status} />;
}
