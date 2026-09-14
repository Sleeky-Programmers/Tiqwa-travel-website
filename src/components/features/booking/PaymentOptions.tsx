'use client';

import { Building2, Calendar, ChevronRight, Clock, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { linkVariants } from '@/components/ui/Link';
import { parseInstalments } from '@/lib/utils';
import { getPaymentGateways, getPaymentMethods } from '@/services/whitelabel-api';

interface PaymentMethod {
	id: number;
	title: string;
	identifier: string;
	description: string;
	priority: number;
	instalments: string | null;
	interest_rate: number;
}

interface PaymentGateway {
	service: string;
	logo: string;
}

interface PaymentOptionsProps {
	onSelect: (method: string, gateway: string, instalment?: number) => void;
	isLoading?: boolean;
}

export function PaymentOptions({ onSelect, isLoading = false }: PaymentOptionsProps) {
	const [methods, setMethods] = useState<PaymentMethod[]>([]);
	const [gateways, setGateways] = useState<PaymentGateway[]>([]);
	const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
	const [showGateways, setShowGateways] = useState(false);
	const [showInstalments, setShowInstalments] = useState(false);
	const [selectedInstalment, setSelectedInstalment] = useState<number | null>(null);
	const [selectedMethodData, setSelectedMethodData] = useState<PaymentMethod | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(true);

	useEffect(() => {
		async function fetchPaymentData() {
			try {
				const [methodsResult, gatewaysResult] = await Promise.all([getPaymentMethods(), getPaymentGateways()]);
				if (methodsResult.success) setMethods(methodsResult.data);
				if (gatewaysResult.success) setGateways(gatewaysResult.data);
			} catch (error) {
				console.error('Failed to fetch payment data:', error);
			} finally {
				setIsLoadingData(false);
			}
		}
		fetchPaymentData();
	}, []);

	const handleMethodSelect = (method: PaymentMethod) => {
		setSelectedMethod(method.identifier);
		setSelectedMethodData(method);

		// Walk-In Transfer: Direct to onSelect with no gateway
		if (method.identifier === 'WALK_IN_TRANSFER') {
			onSelect(method.identifier, '');
			return;
		}

		// Flexi Pay: Show instalment options
		if (method.identifier === 'FLEXI_PAY') {
			const instalments = parseInstalments(method.instalments);
			if (instalments.length > 0) {
				setShowInstalments(true);
				setShowGateways(false);
			} else {
				// If no instalments, go directly to gateways
				setShowGateways(true);
				setShowInstalments(false);
			}
			return;
		}

		// Other methods: Show gateways
		setShowGateways(true);
		setShowInstalments(false);
	};

	const handleInstalmentSelect = (instalment: number) => {
		setSelectedInstalment(instalment);
		// After selecting instalment, show gateways
		setShowGateways(true);
		setShowInstalments(false);
	};

	const handleGatewaySelect = (gateway: string) => {
		if (selectedMethod) {
			// Pass the selected instalment along with method and gateway
			onSelect(selectedMethod, gateway, selectedInstalment || undefined);
		}
	};

	const getMethodIcon = (identifier: string) => {
		const icons: Record<string, any> = {
			CARD: CreditCard,
			ONLINE_TRANSFER: Building2,
			FLEXI_PAY: Calendar,
			WALK_IN_TRANSFER: Clock,
		};
		const Icon = icons[identifier] || CreditCard;
		return <Icon className="h-5 w-5" />;
	};

	const getMethodPresentation = (method: PaymentMethod) => {
		const presentations: Record<string, { title: string; description: string; badge?: { label: string; className: string } }> = {
			ONLINE_TRANSFER: {
				title: 'Online Transfer',
				description: 'Make a direct bank transfer. Your booking is confirmed once payment is received.',
			},
			CARD: {
				title: 'Credit / Debit Card',
				description: 'Pay with MasterCard, Visa, or Verve. Fast and secure online payment.',
			},
			FLEXI_PAY: {
				title: 'Flexi Pay (Installments)',
				description: 'Split your payment into 2, 3, or 4 installments. Pay a percentage upfront to secure your booking.',
				badge: { label: 'Pay in 2, 3, 4 instalments', className: 'bg-blue-500/20 text-blue-700' },
			},
			WALK_IN_TRANSFER: {
				title: 'Book on Hold',
				description: 'Reserve your booking for 24-48 hours without paying. Lock in the current price and pay later before the hold expires.',
				badge: { label: 'Hold for 24-48hrs', className: 'bg-yellow-500/20 text-yellow-700' },
			},
		};

		return (
			presentations[method.identifier] ?? {
				title: method.title,
				description: method.description.replace(/<[^>]*>/g, ''),
			}
		);
	};

	if (isLoadingData) {
		return (
			<div className="flex justify-center py-8">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	// Show instalment options for Flexi Pay
	if (showInstalments && selectedMethodData) {
		const instalments = parseInstalments(selectedMethodData.instalments);

		return (
			<div className="space-y-4">
				<button
					onClick={() => {
						setShowInstalments(false);
						setSelectedMethod(null);
					}}
					className={linkVariants({ variant: 'default' })}>
					← Back to payment methods
				</button>

				<div>
					<h3 className="text-lg font-semibold">Select Instalment Plan</h3>
					<p className="text-sm text-muted-foreground">Choose how many instalments you want to spread your payment over.</p>
				</div>

				<div className="space-y-3">
					{instalments.length === 0 ? (
						<p className="text-sm text-muted-foreground">No instalment options available.</p>
					) : (
						instalments.map((num) => (
							<Card
								key={num}
								hover={false}
								className={`cursor-pointer p-4 transition-all hover:border-primary/50 hover:shadow-md ${selectedInstalment === num ? 'border-primary bg-primary/5' : ''}`}
								onClick={() => handleInstalmentSelect(num)}>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">{num} Instalments</p>
										<p className="text-sm text-muted-foreground">
											Pay {Math.round(100 / num)}% now, remaining in {num - 1} instalments
										</p>
									</div>
									{selectedInstalment === num && <div className="h-4 w-4 rounded-full bg-primary" />}
								</div>
							</Card>
						))
					)}
				</div>

				{selectedInstalment && (
					<Button
						className="w-full"
						onClick={() => setShowGateways(true)}>
						Continue to Payment
					</Button>
				)}
			</div>
		);
	}

	// Show gateways after method is selected
	if (showGateways && selectedMethod) {
		const methodData = methods.find((m) => m.identifier === selectedMethod);
		return (
			<div className="space-y-4">
				<button
					onClick={() => {
						setShowGateways(false);
						if (selectedMethod === 'FLEXI_PAY') {
							setShowInstalments(true);
						} else {
							setSelectedMethod(null);
						}
					}}
					className={linkVariants({ variant: 'default' })}>
					← Back
				</button>
				<div className="space-y-3">
					<p className="text-sm font-medium">
						Choose payment gateway for {methodData?.title}
						{selectedInstalment && ` (${selectedInstalment} instalments)`}
					</p>
					{gateways.length === 0 && <p className="text-sm text-muted-foreground">No payment gateways are available right now. Please try again shortly.</p>}
					{gateways.map((gateway) => (
						<Card
							key={gateway.service}
							hover={false}
							className="cursor-pointer p-4 transition-all hover:border-primary/50 hover:shadow-md"
							onClick={() => handleGatewaySelect(gateway.service)}>
							<div className="flex items-center gap-4">
								{gateway.logo && (
									<div className="size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-white/50 p-1.5">
										<img
											src={gateway.logo}
											alt={gateway.service}
											className="h-full w-full object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = 'none';
											}}
										/>
									</div>
								)}
								<div className="flex-1">
									<p className="font-medium capitalize">{gateway.service}</p>
								</div>
								<ChevronRight className="h-4 w-4 text-muted-foreground" />
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Show payment methods
	return (
		<div className="space-y-4">
			<p className="text-sm font-medium">Select payment method</p>
			<div className="space-y-3">
				{methods.map((method) => (
					<Card
						key={method.id}
						hover={false}
						className="cursor-pointer p-4 transition-all hover:border-primary/50 hover:shadow-md"
						onClick={() => handleMethodSelect(method)}>
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">{getMethodIcon(method.identifier)}</div>
							<div className="flex-1">
								{(() => {
									const presentation = getMethodPresentation(method);
									return (
										<>
											<div className="flex flex-wrap items-center gap-2">
												<p className="font-medium">{presentation.title}</p>
												{presentation.badge && (
													<span className={`rounded-full px-2 py-1 text-[8px] font-semibold leading-none ${presentation.badge.className}`}>
														{presentation.badge.label}
													</span>
												)}
											</div>
											<p className="line-clamp-2 text-sm text-muted-foreground">{presentation.description}</p>
										</>
									);
								})()}
							</div>
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
