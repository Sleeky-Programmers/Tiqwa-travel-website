import { CtaBand } from '@/components/features/home/CtaBand';
import { DreamDestinations } from '@/components/features/home/DreamDestinations';
import { HeroSection } from '@/components/features/home/HeroSection';
import { HolidayPackages } from '@/components/features/home/HolidayPackages';
import { PopularRoutes } from '@/components/features/home/PopularRoutes';
// import { TestimonialsSection } from '@/components/features/home/TestimonialsSection';
// import { TrustBanner } from '@/components/features/home/TrustBanner';
// import { WhyChooseUs } from '@/components/features/home/WhyChooseUs';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getHomepageData, getPopularAirports } from '@/services/whitelabel-api';

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
		<PublicLayout>
			<div className="page-fade-in">
				<HeroSection heroImage={heroImage} />
				{/* <TrustBanner /> */}
				<PopularRoutes />
				<HolidayPackages packages={homepage.holiday_packages ?? []} />
				{/* <WhyChooseUs /> */}
				<DreamDestinations popularAirports={popularAirports} />
				{/* <TestimonialsSection /> */}
				<CtaBand />
			</div>
		</PublicLayout>
	);
}
