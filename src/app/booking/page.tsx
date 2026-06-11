"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, CreditCard, Plane } from "lucide-react";
import { motion } from "motion/react";
import { PassengerForm, type PassengerData } from "@/components/form/PassengerForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { formatFlightPrice, getFlightFromCache } from "@/services/whitelabel-api";
import { getFlightStops } from "@/types/flight";

// Helper function to format card number with spaces
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ").slice(0, 19);
}

// Helper function to format expiry date (MM/YY)
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

// Helper function to format phone number with international support (+234, 0, etc.)
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except '+'
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // If it's empty, return empty
  if (!cleaned) return '';
  
  // Handle Nigerian numbers starting with +234
  if (cleaned.startsWith('+234')) {
    const nationalNumber = cleaned.slice(4);
    if (nationalNumber.length <= 3) return `+234 ${nationalNumber}`;
    if (nationalNumber.length <= 6) return `+234 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3)}`;
    if (nationalNumber.length <= 10) return `+234 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
    return `+234 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 10)}`;
  }
  
  // Handle local Nigerian numbers starting with 0
  if (cleaned.startsWith('0') && cleaned.length <= 11) {
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
  }
  
  // Handle standard digits (international without +)
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)} ${digits.slice(10, 14)}`;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const flightId = searchParams.get("flightId") ?? "";
  const passengers = Number(searchParams.get("passengers") ?? "1");
  const departure = searchParams.get("departure") ?? "";
  const flight = getFlightFromCache(flightId);

  const [passenger, setPassenger] = useState<PassengerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  // Handle expiry input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

  // Handle phone number formatting with international support
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setPassenger({ ...passenger, phone: formatted });
  };

  if (!flight) {
    return (
<Container className="flex min-h-[70vh] items-center justify-center py-28">
  <div className="text-center">
    <p className="text-lg font-medium">Flight not found</p>
    <p className="mt-2 text-sm text-muted-foreground">
      Please select a flight from the search results.
    </p>
    <Link href="/search" className="mt-4 inline-block text-primary hover:underline">
      Search for flights
    </Link>
  </div>
</Container>
    );
  }

  const total = flight.price * passengers;
  const currency = flight.currency ?? "NGN";

  if (confirmed) {
    return (
      <Container className="page-fade-in py-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glossy mx-auto max-w-md rounded-2xl p-10 text-center"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold">Booking Confirmed!</h2>
          <p className="mt-2 text-muted-foreground">
            Your flight from {flight.from} to {flight.to} has been booked. A
            confirmation email will be sent to {passenger.email || "your email"}.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Total paid:{" "}
            <span className="font-semibold text-foreground">
              {formatFlightPrice(total, currency)}
            </span>
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Back to Home</Button>
          </Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="page-fade-in py-28">
      <Container size="md">
        <Link
          href={`/results?from=${encodeURIComponent(flight.from)}&to=${encodeURIComponent(flight.to)}&departure=${departure}&passengers=${passengers}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold sm:text-3xl">Complete Your Booking</h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card hover={false}>
                <PassengerForm 
                  data={passenger} 
                  onChange={setPassenger}
                  onPhoneChange={handlePhoneChange}
                />
              </Card>
              <Card hover={false}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your information is encrypted and protected.
                  </p>
                  <Input
                    label="Card Number"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Expiry Date"
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    <Input
                      label="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <Card hover={false} className="sticky top-24">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{flight.airline}</p>
                    <p className="text-sm text-muted-foreground">
                      {flight.from} → {flight.to}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departure</span>
                    <span>{flight.departure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrival</span>
                    <span>{flight.arrival}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{flight.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stops</span>
                    <span>
                      {getFlightStops(flight) === 0
                        ? "Non-stop"
                        : getFlightStops(flight)}
                    </span>
                  </div>
                  {departure && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{departure}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span>{passengers}</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatFlightPrice(flight.price, currency)} × {passengers}
                    </span>
                    <span>{formatFlightPrice(total, currency)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatFlightPrice(total, currency)}
                    </span>
                  </div>
                </div>
                <Button className="mt-6 w-full" size="lg" onClick={() => setConfirmed(true)}>
                  Confirm Booking
                </Button>
              </Card>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-12">
          <p className="text-muted-foreground">Loading booking...</p>
        </Container>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
