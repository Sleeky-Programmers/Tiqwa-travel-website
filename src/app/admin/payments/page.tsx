'use client';

import { Building2, Calendar, CreditCard, FileText, Landmark, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminTable } from '@/components/admin/AdminTable';
import { PaymentInvoiceModal } from '@/components/admin/PaymentInvoiceModal';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNaira } from '@/data/admin-mock-data';
import { getAdminPayments, getFlexiPayments } from '@/services/whitelabel-api';

import type { Payment } from '@/services/whitelabel-api';

type TabType = 'all' | 'flexi' | 'walkin';

const tabs: Array<{ key: TabType; label: string; autoFilter?: string }> = [
	{ key: 'all', label: 'All Transactions' },
	{ key: 'flexi', label: 'Flexi-Pay', autoFilter: 'FLEXI_PAY' },
	{ key: 'walkin', label: 'Walk-In Transfers', autoFilter: 'WALK_IN_TRANSFER' },
];

const paymentMethodIcons: Record<string, React.ElementType> = {
	CARD: CreditCard,
	ONLINE_TRANSFER: Building2,
	FLEXI_PAY: Calendar,
	WALK_IN_TRANSFER: Landmark,
};

const paymentMethodLabels: Record<string, string> = {
	CARD: 'Card',
	ONLINE_TRANSFER: 'Online Transfer',
	FLEXI_PAY: 'Flexi-Pay',
	WALK_IN_TRANSFER: 'Walk-In Transfer',
};

const paymentGatewayLabels: Record<string, string> = {
	paystack: 'Paystack',
	flutterwave: 'Flutterwave',
	skipcash: 'Skipcash',
};

const paymentMethodOptions = [
	{ value: 'ALL', label: 'All Methods' },
	{ value: 'CARD', label: 'Card' },
	{ value: 'ONLINE_TRANSFER', label: 'Online Transfer' },
	{ value: 'FLEXI_PAY', label: 'Flexi-Pay' },
	{ value: 'WALK_IN_TRANSFER', label: 'Walk-In Transfer' },
];

const paymentGatewayOptions = [
	{ value: 'ALL', label: 'All Gateways' },
	{ value: 'paystack', label: 'Paystack' },
	{ value: 'flutterwave', label: 'Flutterwave' },
	{ value: 'skipcash', label: 'Skipcash' },
];

const paymentStatusOptions = [
	{ value: 'ALL', label: 'All Statuses' },
	{ value: 'Pending', label: 'Pending' },
	{ value: 'Paid', label: 'Paid' },
	{ value: 'Failed', label: 'Failed' },
];

export default function AdminPaymentsPage() {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabType>('all');
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
	const [selectedGateway, setSelectedGateway] = useState<string>('ALL');
	const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch payments from API
	useEffect(() => {
		async function loadPayments() {
			setIsLoading(true);
			try {
				let result;
				if (activeTab === 'flexi') {
					result = await getFlexiPayments();
				} else {
					result = await getAdminPayments();
				}
				if (result.success) {
					setPayments(result.data);
				}
			} catch (error) {
				console.error('Failed to load payments:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadPayments();
	}, [activeTab]);

	// Auto-filter when tab changes to flexi or walkin
	useEffect(() => {
		const tab = tabs.find((t) => t.key === activeTab);
		if (tab?.autoFilter) {
			setSelectedMethod(tab.autoFilter);
		} else if (activeTab === 'all') {
			setSelectedMethod('ALL');
		}
	}, [activeTab]);

	const filteredPayments = useMemo(() => {
		let data = payments;

		// Search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			data = data.filter(
				(p) => p.reference.toLowerCase().includes(query) || p.order_reference.toLowerCase().includes(query) || (p.booking_id && p.booking_id.includes(query))
			);
		}

		// Method filter
		if (selectedMethod !== 'ALL') {
			data = data.filter((p) => p.payment_method === selectedMethod);
		}

		// Gateway filter
		if (selectedGateway !== 'ALL') {
			data = data.filter((p) => p.payment_gateway === selectedGateway);
		}

		// Status filter
		if (selectedStatus !== 'ALL') {
			data = data.filter((p) => p.status === selectedStatus);
		}

		return data;
	}, [payments, searchQuery, selectedMethod, selectedGateway, selectedStatus]);

	const handleViewInvoice = (payment: Payment) => {
		setSelectedPayment(payment);
		setIsModalOpen(true);
	};

	const clearFilters = () => {
		setSearchQuery('');
		setSelectedGateway('ALL');
		setSelectedStatus('ALL');
		const tab = tabs.find((t) => t.key === activeTab);
		if (tab?.autoFilter) {
			setSelectedMethod(tab.autoFilter);
		} else {
			setSelectedMethod('ALL');
		}
	};

	const hasActiveFilters = searchQuery.trim() !== '' || selectedGateway !== 'ALL' || selectedStatus !== 'ALL' || (activeTab === 'all' && selectedMethod !== 'ALL');

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			// Search is reactive
		}
	};

	const getMethodOptions = () => {
		const tab = tabs.find((t) => t.key === activeTab);
		if (tab?.autoFilter) {
			return paymentMethodOptions.filter((opt) => opt.value === 'ALL' || opt.value === tab.autoFilter);
		}
		return paymentMethodOptions;
	};

	const methodOptions = getMethodOptions();

	const columns = [
		{
			key: 'reference',
			header: 'Reference',
			render: (item: Payment) => <span className="font-mono text-xs">{item.reference}</span>,
		},
		{
			key: 'order_reference',
			header: 'Order Ref',
			render: (item: Payment) => <span className="font-mono text-xs">{item.order_reference}</span>,
		},
		{
			key: 'payment_for',
			header: 'Service',
			render: (item: Payment) => <span className="capitalize">{item.payment_for}</span>,
		},
		{
			key: 'amount',
			header: 'Amount',
			render: (item: Payment) => <span className="font-medium">{formatNaira(item.amount)}</span>,
		},
		{
			key: 'amount_settled',
			header: 'Settled',
			render: (item: Payment) => <span className="text-muted-foreground">{formatNaira(item.amount_settled)}</span>,
		},
		{
			key: 'payment_method',
			header: 'Method',
			render: (item: Payment) => {
				const Icon = paymentMethodIcons[item.payment_method] || CreditCard;
				return (
					<span className="flex items-center gap-1.5">
						<Icon className="h-3.5 w-3.5 text-muted-foreground" />
						{paymentMethodLabels[item.payment_method] || item.payment_method}
					</span>
				);
			},
		},
		{
			key: 'payment_gateway',
			header: 'Gateway',
			render: (item: Payment) => <span className="text-xs">{paymentGatewayLabels[item.payment_gateway] || item.payment_gateway}</span>,
		},
		{
			key: 'status',
			header: 'Status',
			render: (item: Payment) => (
				<StatusBadge
					status={item.status}
					statusMap={{
						Pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600' },
						Paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600' },
						Failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600' },
					}}
				/>
			),
		},
		{
			key: 'paid_at',
			header: 'Paid At',
			render: (item: Payment) => (item.paid_at ? new Date(item.paid_at).toLocaleDateString() : '—'),
		},
		{
			key: 'actions',
			header: 'Action',
			render: (item: Payment) => (
				<Button
					size="sm"
					variant="outline"
					onClick={() => handleViewInvoice(item)}>
					<FileText className="h-3.5 w-3.5 mr-1" />
					Invoice
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
			<div>
				<h1 className="text-2xl font-bold">Payments</h1>
				<p className="text-muted-foreground">Manage all payment transactions</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 border-b border-border/60">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
							activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
						}`}>
						{tab.label}
					</button>
				))}
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				{/* Search Input with Button */}
				<div className="relative flex flex-1 min-w-[200px]">
					<Input
						ref={searchInputRef}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search by reference or order ID..."
						className="pl-9 pr-20 h-9 rounded-r-none"
					/>
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Button
						onClick={() => searchInputRef.current?.focus()}
						size="sm"
						className="rounded-l-none h-9 px-4 border-l-0 shrink-0">
						<Search className="h-4 w-4" />
					</Button>
				</div>

				{/* Method Dropdown */}
				<div className="flex flex-col gap-1.5 min-w-[160px]">
					<label className="text-xs font-medium text-foreground">Method</label>
					<Select
						value={selectedMethod}
						onValueChange={setSelectedMethod}>
						<SelectTrigger className="h-9 w-full bg-background">
							<SelectValue placeholder="All Methods" />
						</SelectTrigger>
						<SelectContent>
							{methodOptions.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}>
									{activeTab !== 'all' && opt.value === 'ALL' ? `All ${tabs.find((t) => t.key === activeTab)?.label}` : opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Gateway Dropdown */}
				<div className="flex flex-col gap-1.5 min-w-[160px]">
					<label className="text-xs font-medium text-foreground">Gateway</label>
					<Select
						value={selectedGateway}
						onValueChange={setSelectedGateway}>
						<SelectTrigger className="h-9 w-full bg-background">
							<SelectValue placeholder="All Gateways" />
						</SelectTrigger>
						<SelectContent>
							{paymentGatewayOptions.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Status Dropdown */}
				<div className="flex flex-col gap-1.5 min-w-[160px]">
					<label className="text-xs font-medium text-foreground">Status</label>
					<Select
						value={selectedStatus}
						onValueChange={setSelectedStatus}>
						<SelectTrigger className="h-9 w-full bg-background">
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							{paymentStatusOptions.map((opt) => (
								<SelectItem
									key={opt.value}
									value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="text-muted-foreground mt-[22px]">
						<X className="h-4 w-4 mr-1" />
						Clear
					</Button>
				)}
			</div>

			{/* Table */}
			<AdminTable
				data={filteredPayments}
				columns={columns}
				getRowKey={(item) => item.id}
				emptyMessage={`No ${activeTab === 'all' ? 'payments' : tabs.find((t) => t.key === activeTab)?.label} found`}
				isLoading={isLoading}
				skeletonRows={5}
			/>

			{/* Pagination */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<p>Showing {filteredPayments.length} payments</p>
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

			{/* Invoice Modal */}
			<PaymentInvoiceModal
				payment={selectedPayment}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedPayment(null);
				}}
			/>
		</motion.div>
	);
}
