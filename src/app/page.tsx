import { HeroSection } from "@/components/features/home/HeroSection";
import { TrustBanner } from "@/components/features/home/TrustBanner";
import { PopularRoutes } from "@/components/features/home/PopularRoutes";
import { HolidayPackages } from "@/components/features/home/HolidayPackages";
import { WhyChooseUs } from "@/components/features/home/WhyChooseUs";
import { DreamDestinations } from "@/components/features/home/DreamDestinations";
import { TestimonialsSection } from "@/components/features/home/TestimonialsSection";
import {
  getHomepageData,
  getPopularAirports,
} from "@/services/whitelabel-api";

export default async function HomePage() {
  const [homepage, popularAirports] = await Promise.all([
    getHomepageData().catch(() => ({
      hero_banners: [],
      holiday_packages: [],
    })),
    getPopularAirports().catch(() => []),
  ]);

  const heroImage = homepage.hero_banners?.[0]?.image;

  return (
    <div className="page-fade-in">
      <HeroSection heroImage={heroImage} />
      <TrustBanner />
      <PopularRoutes />
      <HolidayPackages packages={homepage.holiday_packages ?? []} />
      <WhyChooseUs />
      <DreamDestinations popularAirports={popularAirports} />
      <TestimonialsSection />
    </div>
  );
}
