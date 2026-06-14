"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  clearActiveBooking,
  formatFlightPrice,
  getBookingDetails,
} from "@/services/whitelabel-api";
import type { BookingDetails } from "@/types/whitelabel";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    searchParams.get("booking_ref");
  const status = searchParams.get("status") ?? searchParams.get("payment_status");

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuccess =
    status === "success" ||
    status === "successful" ||
    searchParams.get("success") === "true";

  useEffect(() => {
    if (!reference) {
      setIsLoading(false);
      return;
    }

    if (!isSuccess) {
      setIsLoading(false);
      return;
    }

    async function loadDetails() {
      const result = await getBookingDetails(reference!);
      if (result.success) {
        setBookingDetails(result.data);
        clearActiveBooking();
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }

    loadDetails();
  }, [reference, isSuccess]);

  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying your payment...</p>
      </Container>
    );
  }

  if (isSuccess && bookingDetails) {
    return (
      <Container className="py-20">
        <div className="glossy-card mx-auto max-w-md p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold">Payment Successful!</h1>
          <p className="mt-2 text-muted-foreground">
            Your flight has been booked. A confirmation email has been sent.
          </p>
          <div className="mt-6 space-y-3 rounded-lg bg-muted p-4 text-left text-sm">
            <div>
              <p className="font-medium">Booking Reference</p>
              <p className="font-mono">{bookingDetails.reference}</p>
            </div>
            {bookingDetails.status && (
              <div>
                <p className="font-medium">Status</p>
                <p className="capitalize">{String(bookingDetails.status)}</p>
              </div>
            )}
            {bookingDetails.amount != null && (
              <div>
                <p className="font-medium">Amount Paid</p>
                <p>
                  {formatFlightPrice(
                    bookingDetails.amount,
                    bookingDetails.currency ?? "NGN"
                  )}
                </p>
              </div>
            )}
          </div>
          <Link href="/" className="mt-6 block">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (isSuccess && error) {
    return (
      <Container className="py-20">
        <div className="glossy-card mx-auto max-w-md p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold">Payment Received</h1>
          <p className="mt-2 text-muted-foreground">
            Your payment was successful, but we couldn&apos;t load booking
            details right now.
          </p>
          {reference && (
            <div className="mt-6 rounded-lg bg-muted p-4 text-left">
              <p className="text-sm font-medium">Reference</p>
              <p className="font-mono text-sm">{reference}</p>
            </div>
          )}
          <p className="mt-4 text-sm text-destructive">{error}</p>
          <Link href="/" className="mt-6 block">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      <div className="glossy-card mx-auto max-w-md p-8 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold">Payment Failed</h1>
        <p className="mt-2 text-muted-foreground">
          Your payment could not be processed. Please try again.
        </p>
        {reference && (
          <div className="mt-6 rounded-lg bg-muted p-4 text-left">
            <p className="text-sm font-medium">Reference</p>
            <p className="font-mono text-sm">{reference}</p>
          </div>
        )}
        <Link href="/search" className="mt-6 block">
          <Button className="w-full">Search Again</Button>
        </Link>
      </div>
    </Container>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container className="flex min-h-[60vh] items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Container>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
