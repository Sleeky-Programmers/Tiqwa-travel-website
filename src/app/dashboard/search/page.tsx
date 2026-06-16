'use client';

import { Calendar, MapPin, Plane } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { FlightSearchForm } from '@/components/features/FlightSearchForm';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

export default function DashboardSearchPage() {
	const router = useRouter();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Search Flights</h1>
				<p className="text-muted-foreground">Find and book your next flight</p>
			</div>

			<Card
				hover={false}
				className="p-6">
				<FlightSearchForm />
			</Card>

			{/* Quick Tips */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="glossy-card p-4 text-center">
					<Plane className="mx-auto h-6 w-6 text-primary" />
					<h3 className="mt-2 font-semibold">Best Price Guarantee</h3>
					<p className="text-sm text-muted-foreground">We match any lower price</p>
				</div>
				<div className="glossy-card p-4 text-center">
					<Calendar className="mx-auto h-6 w-6 text-primary" />
					<h3 className="mt-2 font-semibold">Flexible Dates</h3>
					<p className="text-sm text-muted-foreground">Search multiple dates at once</p>
				</div>
				<div className="glossy-card p-4 text-center">
					<MapPin className="mx-auto h-6 w-6 text-primary" />
					<h3 className="mt-2 font-semibold">500+ Destinations</h3>
					<p className="text-sm text-muted-foreground">Fly to cities worldwide</p>
				</div>
			</div>
		</div>
	);
}
