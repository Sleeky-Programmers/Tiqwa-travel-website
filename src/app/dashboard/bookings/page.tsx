"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Plane, MapPin } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  formatFlightPrice,
  getFlightBookings,
  type FlightBooking,
} from "@/services/whitelabel-api";

type TabType = "upcoming" | "past" | "cancelled";

function formatBookingDate(dateStr: string): string {
  if (!dateStr) return "—";
  const parsed = parseISO(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
  return isValid(parsed) ? format(parsed, "MMM dd, yyyy") : dateStr;
}

function getBookingDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parsed = parseISO(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
  return isValid(parsed) ? parsed : null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  useEffect(() => {
    async function loadBookings() {
      const result = await getFlightBookings();
      if (result.success) {
        setBookings(result.data);
      }
      setIsLoading(false);
    }
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = getBookingDate(booking.departureDate);
    const isPast = bookingDate ? bookingDate < new Date() : false;
    if (activeTab === "upcoming") {
      return !isPast && booking.status !== "cancelled";
    }
    if (activeTab === "past") {
      return isPast && booking.status !== "cancelled";
    }
    return booking.status === "cancelled";
  });

  const tabs = [
    { key: "upcoming" as const, label: "Upcoming" },
    { key: "past" as const, label: "Past" },
    { key: "cancelled" as const, label: "Cancelled" },
  ];

  return (
    <div className="dashboard-page space-y-6">
      <div className="dashboard-page-header">
        <h1 className="dashboard-title">My Bookings</h1>
        <p className="dashboard-subtitle">
          View and manage your flight reservations
        </p>
      </div>

      <div className="flex gap-2 border-b border-border/60">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`dashboard-tab ${
              activeTab === tab.key ? "dashboard-tab-active" : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card hover={false} className="p-12 text-center">
          <p className="text-muted-foreground">No {activeTab} bookings found</p>
          {activeTab === "upcoming" && (
            <Link
              href="/search"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Search for flights
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id || booking.reference}
              hover={false}
              className="p-4 transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{booking.from}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{booking.to}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatBookingDate(booking.departureDate)}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <MapPin className="h-3 w-3" />
                        {booking.cabin || "Economy"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatFlightPrice(booking.amount, booking.currency)}
                    </p>
                    <p
                      className={`text-xs capitalize ${
                        booking.status === "confirmed"
                          ? "text-green-600"
                          : booking.status === "cancelled"
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      {booking.status}
                    </p>
                  </div>
                  <Link href={`/booking-details/${booking.reference}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
