"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  CreditCard,
  Building2,
  Calendar,
  Landmark,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira } from "@/data/admin-mock-data";
import { cn } from "@/lib/utils";

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
  CARD: "Card",
  ONLINE_TRANSFER: "Online Transfer",
  FLEXI_PAY: "Flexi-Pay",
  WALK_IN_TRANSFER: "Walk-In Transfer",
};

export function PaymentInvoiceModal({ payment, isOpen, onClose }: PaymentInvoiceModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      // Show toast notification
    }, 1500);
  };

  if (!payment) return null;

  const Icon = paymentMethodIcons[payment.payment_method] || CreditCard;
  const isFlexiPay = payment.payment_method === "FLEXI_PAY";

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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl glossy"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Payment Invoice</h2>
                <p className="text-sm text-muted-foreground">
                  Reference: <span className="font-mono">{payment.reference}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-primary/10">
              <StatusBadge
                status={payment.status}
                statusMap={{
                  Pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600" },
                  Paid: { label: "Paid", className: "bg-green-500/10 text-green-600" },
                  Failed: { label: "Failed", className: "bg-red-500/10 text-red-600" },
                }}
              />
              <span className="text-sm text-primary">
                {payment.paid_at
                  ? `Paid on ${new Date(payment.paid_at).toLocaleString()}`
                  : "Not paid yet"}
              </span>
            </div>

            {/* Payment Summary */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {formatNaira(payment.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Settled: {formatNaira(payment.amount_settled)}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">Method</p>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{paymentMethodLabels[payment.payment_method]}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gateway: {payment.payment_gateway}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-6 p-4 rounded-xl border border-border">
              <h3 className="text-sm font-semibold mb-3">Order Details</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Order Reference</span>
                  <p className="font-mono">{payment.order_reference}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Service</span>
                  <p className="capitalize">{payment.payment_for}</p>
                </div>
                {payment.booking_id && (
                  <div>
                    <span className="text-muted-foreground">Booking ID</span>
                    <p className="font-mono">{payment.booking_id}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p>{new Date(payment.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Flexi-Pay Details */}
            {isFlexiPay && payment.flexi_pay_details && (
              <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Flexi-Pay Schedule
                </h3>
                <div className="grid gap-2 text-sm sm:grid-cols-3 mb-4">
                  <div>
                    <span className="text-muted-foreground">Total Payable</span>
                    <p className="font-medium">{formatNaira(payment.flexi_pay_details.payable_amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Paid</span>
                    <p className="font-medium text-green-600">
                      {formatNaira(payment.flexi_pay_details.total_paid)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Payment</span>
                    <p className="font-medium">
                      {payment.flexi_pay_details.next_pay_date
                        ? new Date(payment.flexi_pay_details.next_pay_date).toLocaleDateString()
                        : "Completed"}
                    </p>
                  </div>
                </div>
                {payment.flexi_pay_details.flexi_pay_dates.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Installment Schedule</p>
                    {payment.flexi_pay_details.flexi_pay_dates.map((date: any) => (
                      <div
                        key={date.id}
                        className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/50"
                      >
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
            {payment.gateway_response && (
              <div className="mb-6 p-4 rounded-xl border border-border">
                <h3 className="text-sm font-semibold mb-2">Gateway Response</h3>
                <p className="text-sm">
                  <span className="text-muted-foreground">Code:</span> {payment.gateway_response.code}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Message:</span> {payment.gateway_response.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <Button onClick={handleDownload} disabled={isDownloading}>
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download PDF"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}