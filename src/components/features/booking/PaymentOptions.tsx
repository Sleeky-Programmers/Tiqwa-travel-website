'use client';

import { Building2, Calendar, ChevronRight, CreditCard, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
			WALK_IN_TRANSFER: Landmark,
		};
		const Icon = icons[identifier] || CreditCard;
		return <Icon className="h-5 w-5" />;
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
					className="text-sm text-primary hover:underline">
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
					className="text-sm text-primary hover:underline">
					← Back
				</button>
				<div className="space-y-3">
					<p className="text-sm font-medium">
						Choose payment gateway for {methodData?.title}
						{selectedInstalment && ` (${selectedInstalment} instalments)`}
					</p>
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
								<p className="font-medium">{method.title}</p>
								<p className="line-clamp-2 text-sm text-muted-foreground">{method.description.replace(/<[^>]*>/g, '')}</p>
								{method.identifier === 'FLEXI_PAY' && <p className="mt-1 text-xs text-primary">Pay in {parseInstalments(method.instalments).join(', ')} instalments</p>}
							</div>
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
