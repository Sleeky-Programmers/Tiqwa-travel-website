'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Building2, Calendar, CreditCard, Download, Landmark, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/data/admin-mock-data';
import { getPaymentInvoice } from '@/services/whitelabel-api';

interface PaymentInvoiceModalProps {
	payment: any | null;
	isOpen: boolean;
	onClose: () => void;
}

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

export function PaymentInvoiceModal({ payment, isOpen, onClose }: PaymentInvoiceModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [invoiceData, setInvoiceData] = useState<any>(null);
	const [isDownloading, setIsDownloading] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	// Fetch invoice details when modal opens
	useEffect(() => {
		async function fetchInvoice() {
			if (!payment?.reference || !isOpen) return;

			setIsLoading(true);
			try {
				const result = await getPaymentInvoice(payment.reference);
				if (result.success) {
					setInvoiceData(result.data);
				}
			} catch (error) {
				console.error('Failed to fetch invoice:', error);
			} finally {
				setIsLoading(false);
			}
		}

		if (isOpen && payment) {
			fetchInvoice();
		}
	}, [payment, isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	const downloadPDF = async () => {
		if (!contentRef.current) return;

		setIsDownloading(true);
		try {
			const element = contentRef.current;

			// Wait for any images to load
			const images = element.querySelectorAll('img');
			await Promise.all(
				Array.from(images).map(
					(img) =>
						new Promise((resolve) => {
							if (img.complete) resolve(null);
							else img.onload = () => resolve(null);
						})
				)
			);

			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
				logging: false,
				onclone: (clonedDoc) => {
					// Ensure all elements are visible in the clone
					const clonedElement = clonedDoc.getElementById('invoice-content');
					if (clonedElement) {
						clonedElement.style.display = 'block';
					}
				},
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF('p', 'mm', 'a4');
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

			let heightLeft = pdfHeight;
			let position = 0;

			// First page
			pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
			heightLeft -= pdf.internal.pageSize.getHeight();

			// Additional pages if content overflows
			while (heightLeft > 0) {
				position = heightLeft - pdfHeight;
				pdf.addPage();
				pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
				heightLeft -= pdf.internal.pageSize.getHeight();
			}

			pdf.save(`invoice-${payment?.reference || 'download'}.pdf`);
		} catch (error) {
			console.error('PDF generation failed:', error);
		} finally {
			setIsDownloading(false);
		}
	};

	if (!payment) return null;

	// Use invoice data if available, otherwise fallback to payment prop
	const data = invoiceData || payment;
	const Icon = paymentMethodIcons[data.payment_method] || CreditCard;
	const isFlexiPay = data.payment_method === 'FLEXI_PAY';

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl glossy">
						{/* Header */}
						<div className="flex items-start justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold">Payment Invoice</h2>
								<p className="text-sm text-muted-foreground">
									Reference: <span className="font-mono">{data.reference}</span>
								</p>
							</div>
							<button
								onClick={onClose}
								className="rounded-lg p-2 hover:bg-muted transition-colors">
								<X className="h-5 w-5" />
							</button>
						</div>

						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<span className="ml-3 text-muted-foreground">Loading invoice...</span>
							</div>
						) : (
							<>
								{/* Invoice Content - Hidden but used for PDF generation */}
								<div className="hidden">
									<div
										id="invoice-content"
										ref={contentRef}
										className="p-8 bg-white">
										{/* Invoice Header */}
										<div className="text-center border-b border-gray-200 pb-4 mb-6">
											<h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
											<p className="text-sm text-gray-500">Reference: {data.reference}</p>
										</div>

										{/* Status */}
										<div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-gray-50">
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${
													data.status === 'Paid' ? 'bg-green-100 text-green-700' : data.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
												}`}>
												{data.status}
											</span>
											<span className="text-sm text-gray-600">{data.paid_at ? `Paid on ${new Date(data.paid_at).toLocaleString()}` : 'Not paid yet'}</span>
										</div>

										{/* Payment Summary */}
										<div className="grid grid-cols-2 gap-4 mb-6">
											<div className="p-4 border border-gray-200 rounded-lg">
												<p className="text-sm text-gray-500">Amount</p>
												<p className="text-2xl font-bold text-blue-600">{formatNaira(data.amount)}</p>
												<p className="text-xs text-gray-500">Settled: {formatNaira(data.amount_settled)}</p>
											</div>
											<div className="p-4 border border-gray-200 rounded-lg">
												<p className="text-sm text-gray-500">Method</p>
												<p className="font-medium">{paymentMethodLabels[data.payment_method]}</p>
												<p className="text-xs text-gray-500">Gateway: {data.payment_gateway}</p>
											</div>
										</div>

										{/* Order Details */}
										<div className="mb-6 p-4 border border-gray-200 rounded-lg">
											<h3 className="text-sm font-semibold mb-3">Order Details</h3>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-gray-500">Order Reference</span>
													<p className="font-mono">{data.order_reference}</p>
												</div>
												<div>
													<span className="text-gray-500">Service</span>
													<p className="capitalize">{data.payment_for}</p>
												</div>
												{data.booking_id && (
													<div>
														<span className="text-gray-500">Booking ID</span>
														<p className="font-mono">{data.booking_id}</p>
													</div>
												)}
												<div>
													<span className="text-gray-500">Created</span>
													<p>{new Date(data.created_at).toLocaleString()}</p>
												</div>
											</div>
										</div>

										{/* Flexi-Pay Details */}
										{isFlexiPay && data.flexi_pay_details && (
											<div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
												<h3 className="text-sm font-semibold mb-3">Flexi-Pay Schedule</h3>
												<div className="grid grid-cols-3 gap-2 text-sm mb-4">
													<div>
														<span className="text-gray-500">Total Payable</span>
														<p className="font-medium">{formatNaira(data.flexi_pay_details.payable_amount)}</p>
													</div>
													<div>
														<span className="text-gray-500">Total Paid</span>
														<p className="font-medium text-green-600">{formatNaira(data.flexi_pay_details.total_paid)}</p>
													</div>
													<div>
														<span className="text-gray-500">Next Payment</span>
														<p className="font-medium">
															{data.flexi_pay_details.next_pay_date ? new Date(data.flexi_pay_details.next_pay_date).toLocaleDateString() : 'Completed'}
														</p>
													</div>
												</div>
											</div>
										)}

										{/* Gateway Response */}
										{data.gateway_response && (
											<div className="mb-6 p-4 border border-gray-200 rounded-lg">
												<h3 className="text-sm font-semibold mb-2">Gateway Response</h3>
												<p className="text-sm">
													<span className="text-gray-500">Code:</span> {data.gateway_response.code}
												</p>
												<p className="text-sm">
													<span className="text-gray-500">Message:</span> {data.gateway_response.message}
												</p>
											</div>
										)}

										{/* Footer */}
										<div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-6">
											<p>Generated by Tiqwa Travel • {new Date().toLocaleDateString()}</p>
											<p className="mt-1">This is a system-generated invoice. For queries, contact support@tiqwa.com</p>
										</div>
									</div>
								</div>

								{/* Display Content */}
								<div className="space-y-6">
									{/* Status */}
									<div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10">
										<StatusBadge
											status={data.status}
											statusMap={{
												Pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600' },
												Paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600' },
												Failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600' },
											}}
										/>
										<span className="text-sm text-primary">{data.paid_at ? `Paid on ${new Date(data.paid_at).toLocaleString()}` : 'Not paid yet'}</span>
									</div>

									{/* Payment Summary */}
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="p-4 rounded-xl border border-border">
											<p className="text-sm text-muted-foreground">Amount</p>
											<p className="text-2xl font-bold text-primary">{formatNaira(data.amount)}</p>
											<p className="text-xs text-muted-foreground">Settled: {formatNaira(data.amount_settled)}</p>
										</div>
										<div className="p-4 rounded-xl border border-border">
											<p className="text-sm text-muted-foreground">Method</p>
											<div className="flex items-center gap-2 mt-1">
												<Icon className="h-5 w-5 text-primary" />
												<span className="font-medium">{paymentMethodLabels[data.payment_method]}</span>
											</div>
											<p className="text-xs text-muted-foreground">Gateway: {data.payment_gateway}</p>
										</div>
									</div>

									{/* Order Details */}
									<div className="p-4 rounded-xl border border-border">
										<h3 className="text-sm font-semibold mb-3">Order Details</h3>
										<div className="grid gap-2 text-sm sm:grid-cols-2">
											<div>
												<span className="text-muted-foreground">Order Reference</span>
												<p className="font-mono">{data.order_reference}</p>
											</div>
											<div>
												<span className="text-muted-foreground">Service</span>
												<p className="capitalize">{data.payment_for}</p>
											</div>
											{data.booking_id && (
												<div>
													<span className="text-muted-foreground">Booking ID</span>
													<p className="font-mono">{data.booking_id}</p>
												</div>
											)}
											<div>
												<span className="text-muted-foreground">Created</span>
												<p>{new Date(data.created_at).toLocaleString()}</p>
											</div>
										</div>
									</div>

									{/* Flexi-Pay Details */}
									{isFlexiPay && data.flexi_pay_details && (
										<div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
											<h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
												<Calendar className="h-4 w-4 text-primary" />
												Flexi-Pay Schedule
											</h3>
											<div className="grid gap-2 text-sm sm:grid-cols-3 mb-4">
												<div>
													<span className="text-muted-foreground">Total Payable</span>
													<p className="font-medium">{formatNaira(data.flexi_pay_details.payable_amount)}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Total Paid</span>
													<p className="font-medium text-green-600">{formatNaira(data.flexi_pay_details.total_paid)}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Next Payment</span>
													<p className="font-medium">
														{data.flexi_pay_details.next_pay_date ? new Date(data.flexi_pay_details.next_pay_date).toLocaleDateString() : 'Completed'}
													</p>
												</div>
											</div>
											{data.flexi_pay_details.flexi_pay_dates.length > 0 && (
												<div className="space-y-2">
													<p className="text-xs text-muted-foreground">Installment Schedule</p>
													{data.flexi_pay_details.flexi_pay_dates.map((date: any) => (
														<div
															key={date.id}
															className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/50">
															<span>Installment {date.id}</span>
															<span>{new Date(date.date).toLocaleDateString()}</span>
															<span className="font-medium">{formatNaira(date.amount)}</span>
														</div>
													))}
												</div>
											)}
										</div>
									)}

									{/* Gateway Response */}
									{data.gateway_response && (
										<div className="p-4 rounded-xl border border-border">
											<h3 className="text-sm font-semibold mb-2">Gateway Response</h3>
											<p className="text-sm">
												<span className="text-muted-foreground">Code:</span> {data.gateway_response.code}
											</p>
											<p className="text-sm">
												<span className="text-muted-foreground">Message:</span> {data.gateway_response.message}
											</p>
										</div>
									)}

									{/* Actions */}
									<div className="flex flex-wrap gap-3 pt-4 border-t border-border">
										<Button
											onClick={downloadPDF}
											disabled={isDownloading}>
											{isDownloading ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Generating PDF...
												</>
											) : (
												<>
													<Download className="h-4 w-4 mr-2" />
													Download PDF
												</>
											)}
										</Button>
										<Button
											variant="outline"
											onClick={onClose}>
											Close
										</Button>
									</div>
								</div>
							</>
						)}
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
