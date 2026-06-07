"use client";

import { HeroSection } from "@/components/features/home/HeroSection";
import { TrustBanner } from "@/components/features/home/TrustBanner";
import { PopularRoutes } from "@/components/features/home/PopularRoutes";
import { WhyChooseUs } from "@/components/features/home/WhyChooseUs";
import { DreamDestinations } from "@/components/features/home/DreamDestinations";
import { TestimonialsSection } from "@/components/features/home/TestimonialsSection";

export default function HomePage() {
  return (
    <div className="page-fade-in">
      <HeroSection />
      <TrustBanner />
      <PopularRoutes />
      <WhyChooseUs />
      <DreamDestinations />
      <TestimonialsSection />
    </div>
  );
}
