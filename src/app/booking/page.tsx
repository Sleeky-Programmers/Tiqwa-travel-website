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
import { getFlightBySearchId } from "@/services/flightSearch";

function BookingContent() {
  const searchParams = useSearchParams();
  const flightId = searchParams.get("flightId") ?? "";
  const passengers = Number(searchParams.get("passengers") ?? "1");
  const departure = searchParams.get("departure") ?? "";
  const flight = getFlightBySearchId(flightId);

  const [passenger, setPassenger] = useState<PassengerData>({ firstName: "", lastName: "", email: "", phone: "" });
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!flight) {
    return (
      <Container className="py-16 text-center">
        <p className="text-lg font-medium">Flight not found</p>
        <Link href="/search" className="mt-4 inline-block text-primary hover:underline">Search for flights</Link>
      </Container>
    );
  }

  const total = flight.price * passengers;

  if (confirmed) {
    return (
      <Container className="page-fade-in py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glossy mx-auto max-w-md rounded-2xl p-10 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold">Booking Confirmed!</h2>
          <p className="mt-2 text-muted-foreground">
            Your flight from {flight.from} to {flight.to} has been booked.
            A confirmation email will be sent to {passenger.email || "your email"}.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Total paid: <span className="font-semibold text-foreground">${total}</span></p>
          <Link href="/" className="mt-6 inline-block"><Button>Back to Home</Button></Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="page-fade-in py-12">
      <Container size="md">
        <Link href={`/results?from=${flight.from}&to=${flight.to}&departure=${departure}&passengers=${passengers}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold sm:text-3xl">Complete Your Booking</h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card hover={false}><PassengerForm data={passenger} onChange={setPassenger} /></Card>
              <Card hover={false}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Demo only — no real payment will be processed</p>
                  <Input label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Expiry Date" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                    <Input label="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
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
                    <p className="text-sm text-muted-foreground">{flight.from} → {flight.to}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Departure</span><span>{flight.departure}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Arrival</span><span>{flight.arrival}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{flight.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stops</span><span>{flight.stops === 0 ? "Non-stop" : flight.stops}</span></div>
                  {departure && <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{departure}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Passengers</span><span>{passengers}</span></div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">${flight.price} × {passengers}</span><span>${total}</span></div>
                  <div className="mt-2 flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">${total}</span></div>
                </div>
                <Button className="mt-6 w-full" size="lg" onClick={() => setConfirmed(true)}>Confirm Booking</Button>
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
    <Suspense fallback={<Container className="py-12"><p className="text-muted-foreground">Loading booking...</p></Container>}>
      <BookingContent />
    </Suspense>
  );
}
