'use client';

import { format, isValid, parseISO } from 'date-fns';
import { Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { AdminFilters } from '@/components/admin/AdminFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTable } from '@/components/admin/AdminTable';
import { CustomerDetailsModal } from '@/components/admin/CustomerDetailsModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getAdminCustomers } from '@/services/whitelabel-api';
import { formatPhoneNumber } from '@/utils/phone';

import type { AdminCustomer } from '@/services/whitelabel-api';

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
	if (!dateStr) return '—';
	const parsed = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
	return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : dateStr;
}

function AdminCustomersContent() {
	const [customers, setCustomers] = useState<AdminCustomer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [page, setPage] = useState(1);
	const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

	// Fetch customers from API
	useEffect(() => {
		async function loadCustomers() {
			setIsLoading(true);
			try {
				const result = await getAdminCustomers();
				if (result.success) {
					setCustomers(result.data);
				}
			} catch (error) {
				console.error('Failed to load customers:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadCustomers();
	}, []);

	const filteredCustomers = useMemo(() => {
		if (!searchQuery) return customers;
		const query = searchQuery.toLowerCase();
		return customers.filter((customer) => {
			const phone = customer.phone_number?.replace(/\D/g, '') || '';
			const queryDigits = query.replace(/\D/g, '');
			return customer.name?.toLowerCase().includes(query) || customer.email?.toLowerCase().includes(query) || (queryDigits.length > 0 && phone.includes(queryDigits));
		});
	}, [customers, searchQuery]);

	const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
	const paginatedCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const columns = [
		{
			key: 'name',
			header: 'Name',
			render: (customer: AdminCustomer) => <span className="font-medium">{customer.name}</span>,
		},
		{
			key: 'email',
			header: 'Email',
			render: (customer: AdminCustomer) => <span className="text-muted-foreground">{customer.email}</span>,
		},
		{
			key: 'phone_number',
			header: 'Phone',
			render: (customer: AdminCustomer) => (customer.phone_number ? formatPhoneNumber(customer.phone_number) : '—'),
		},
		{
			key: 'loyalty_reward',
			header: 'Loyalty Points',
			render: (customer: AdminCustomer) => (
				<span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">{customer.loyalty_reward ?? 0} pts</span>
			),
		},
		{
			key: 'date_of_birth',
			header: 'DOB',
			render: (customer: AdminCustomer) => <span className="text-muted-foreground">{customer.date_of_birth ? formatDate(customer.date_of_birth) : '—'}</span>,
		},
		{
			key: 'gender',
			header: 'Gender',
			render: (customer: AdminCustomer) => <span className="capitalize">{customer.gender || '—'}</span>,
		},
		{
			key: 'bookings_count',
			header: 'Bookings',
			render: (customer: AdminCustomer) => customer.bookings_count ?? 0,
		},
		{
			key: 'action',
			header: 'Action',
			render: (customer: AdminCustomer) => (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setSelectedCustomer(customer)}>
					<Eye className="h-3.5 w-3.5" />
					View
				</Button>
			),
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-6">
			<div className="dashboard-page-header">
				<h1 className="dashboard-title">Customers Management</h1>
				<p className="dashboard-subtitle">View and manage all registered customers</p>
			</div>

			<AdminFilters
				searchValue={searchQuery}
				onSearchChange={(value) => {
					setSearchQuery(value);
					setPage(1);
				}}
				searchPlaceholder="Search by name, email, or phone..."
				onClear={() => {
					setSearchQuery('');
					setPage(1);
				}}
			/>

			<AdminTable
				data={paginatedCustomers}
				columns={columns}
				isLoading={isLoading}
				emptyMessage="No customers match your search"
				getRowKey={(customer) => customer.id}
				skeletonRows={PAGE_SIZE}
			/>

			<AdminPagination
				page={page}
				totalPages={totalPages}
				totalItems={filteredCustomers.length}
				pageSize={PAGE_SIZE}
				onPageChange={setPage}
				itemLabel="customers"
			/>

			<CustomerDetailsModal
				customer={selectedCustomer}
				open={!!selectedCustomer}
				onOpenChange={(open) => !open && setSelectedCustomer(null)}
			/>
		</motion.div>
	);
}

export default function AdminCustomersPage() {
	return (
		<Suspense
			fallback={
				<div className="space-y-6">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			}>
			<AdminCustomersContent />
		</Suspense>
	);
}
