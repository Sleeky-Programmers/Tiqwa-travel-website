'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

import { AdminTable } from '@/components/admin/AdminTable';
import { BookingStatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatNaira } from '@/data/admin-mock-data';
import { cn } from '@/lib/utils';
import { getFlightBookings } from '@/services/whitelabel-api';

import type { FlightBooking } from '@/services/whitelabel-api';

type BookingStatus = 'PAID' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';

interface AdminBooking {
	id: number;
	reference: string;
	customer: string;
	email: string;
	amount: number;
	status: BookingStatus;
	booking_date: string;
	route: string;
	airline: string;
	passengers: number;
}

const statusOptions = [
	{ value: 'ALL', label: 'All Statuses' },
	{ value: 'PAID', label: 'Paid' },
	{ value: 'PENDING_PAYMENT', label: 'Pending Payment' },
	{ value: 'CONFIRMED', label: 'Confirmed' },
	{ value: 'CANCELLED', label: 'Cancelled' },
];

export function BookingTable() {
	const [bookings, setBookings] = useState<AdminBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
	const [isStatusOpen, setIsStatusOpen] = useState(false);

	useEffect(() => {
		async function loadBookings() {
			setIsLoading(true);
			try {
				const result = await getFlightBookings();
				if (result.success) {
					const mappedBookings: AdminBooking[] = result.data.map((b: FlightBooking) => ({
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
					setBookings(mappedBookings);
				}
			} catch (error) {
				console.error('Failed to load bookings:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadBookings();
	}, []);

	const handleSearch = () => {
		// The search is already reactive, but this can trigger additional logic if needed
		// For now, it's a visual button that works with the input's onChange
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const filteredBookings = useMemo(() => {
		let data = bookings;

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			data = data.filter((b) => b.reference.toLowerCase().includes(query) || b.customer.toLowerCase().includes(query) || b.email.toLowerCase().includes(query));
		}

		// Status filter
		if (selectedStatus !== 'ALL') {
			data = data.filter((b) => b.status === selectedStatus);
		}

		return data;
	}, [bookings, searchQuery, selectedStatus]);

	const clearFilters = () => {
		setSearchQuery('');
		setSelectedStatus('ALL');
	};

	const hasActiveFilters = searchQuery.trim() !== '' || selectedStatus !== 'ALL';

	const selectedStatusLabel = statusOptions.find((opt) => opt.value === selectedStatus)?.label || 'All Statuses';

	const columns = [
		{
			key: 'reference',
			header: 'Reference',
			render: (item: AdminBooking) => <span className="font-mono text-xs font-medium">{item.reference}</span>,
		},
		{
			key: 'customer',
			header: 'Customer',
			render: (item: AdminBooking) => (
				<div>
					<p className="font-medium">{item.customer}</p>
					<p className="text-xs text-muted-foreground">{item.email}</p>
				</div>
			),
		},
		{
			key: 'route',
			header: 'Route',
			render: (item: AdminBooking) => item.route,
		},
		{
			key: 'amount',
			header: 'Amount',
			render: (item: AdminBooking) => <span className="font-medium">{formatNaira(item.amount)}</span>,
		},
		{
			key: 'booking_date',
			header: 'Date',
			render: (item: AdminBooking) => {
				const date = new Date(item.booking_date);
				return date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});
			},
		},
		{
			key: 'status',
			header: 'Status',
			render: (item: AdminBooking) => <BookingStatusBadge status={item.status} />,
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Bookings</h1>
				<p className="text-muted-foreground">Manage all flight bookings</p>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				{/* Search Input with Button */}
				<div className="relative flex flex-1 min-w-[200px]">
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search by reference, customer, or email..."
						className="pl-9 pr-20 h-9 rounded-r-none"
					/>
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Button
						onClick={handleSearch}
						size="sm"
						className="rounded-l-none h-9 px-4 border-l-0">
						<Search className="h-4 w-4" />
					</Button>
				</div>

				{/* Custom Status Dropdown using Popover + Command */}
				<Popover
					open={isStatusOpen}
					onOpenChange={setIsStatusOpen}>
					<PopoverTrigger>
						<Button
							variant="outline"
							className="h-9 justify-between min-w-[160px] rounded-xl border-border bg-background px-3 text-sm font-normal hover:bg-primary/5">
							<span className="truncate">{selectedStatusLabel}</span>
							<ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform', isStatusOpen && 'rotate-180')} />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 glossy"
						align="start">
						<Command>
							<CommandInput
								placeholder="Search status..."
								className="h-9"
							/>
							<CommandList>
								<CommandEmpty>No status found.</CommandEmpty>
								<CommandGroup>
									{statusOptions.map((opt) => (
										<CommandItem
											key={opt.value}
											value={opt.label}
											onSelect={() => {
												setSelectedStatus(opt.value);
												setIsStatusOpen(false);
											}}
											className="flex items-center justify-between">
											{opt.label}
											{selectedStatus === opt.value && <Check className="h-4 w-4 text-primary" />}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="text-muted-foreground">
						<X className="h-4 w-4 mr-1" />
						Clear
					</Button>
				)}
			</div>

			{/* Table */}
			<AdminTable
				data={filteredBookings}
				columns={columns}
				getRowKey={(item) => item.id}
				emptyMessage="No bookings found"
				isLoading={isLoading}
				skeletonRows={5}
			/>

			{/* Pagination */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<p>Showing {filteredBookings.length} bookings</p>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						disabled>
						Previous
					</Button>
					<span className="px-3 py-1 text-sm bg-primary/10 rounded-lg">1</span>
					<Button
						size="sm"
						variant="outline"
						disabled>
						Next
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
