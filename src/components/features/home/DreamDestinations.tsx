'use client';

import { Plane, Search } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { formatFlightPrice } from '@/services/whitelabel-api';
import { getDestinationImage } from '@/utils/images';

import type { PopularAirport } from '@/types/whitelabel';
interface DestinationCard {
	id: string;
	name: string;
	country: string;
	image: string;
	priceFrom?: number;
	currency?: string;
}

interface DreamDestinationsProps {
	popularAirports?: PopularAirport[];
}

// Preview-only fixture, matches docs/DreamDestinations.png. Append ?mockDestinations=1 to the
// homepage URL to render this instead of the live popular-airports data.
const MOCK_DESTINATIONS: DestinationCard[] = [
	{ id: 'mock-lagos', name: 'Lagos', country: 'Nigeria', image: getDestinationImage('Lagos'), priceFrom: 25000 },
	{ id: 'mock-dubai', name: 'Dubai', country: 'UAE', image: getDestinationImage('Dubai'), priceFrom: 350000 },
	{ id: 'mock-london', name: 'London', country: 'UK', image: getDestinationImage('London'), priceFrom: 480000 },
	{ id: 'mock-accra', name: 'Accra', country: 'Ghana', image: getDestinationImage('Accra'), priceFrom: 85000 },
];

function mapAirportsToDestinations(airports: PopularAirport[]): DestinationCard[] {
	return airports.map((airport, i) => ({
		id: airport.iata_code ?? `airport-${i}`,
		name: airport.city,
		country: airport.country,
		image: typeof airport.image === 'string' ? airport.image : getDestinationImage(airport.city),
	}));
}

export function DreamDestinations({ popularAirports = [] }: DreamDestinationsProps) {
	const router = useRouter();
	const [useMockData, setUseMockData] = useState(false);

	useEffect(() => {
		setUseMockData(new URLSearchParams(window.location.search).get('mockDestinations') === '1');
	}, []);

	const destinations: DestinationCard[] = useMockData ? MOCK_DESTINATIONS : popularAirports.length > 0 ? mapAirportsToDestinations(popularAirports) : [];

	const handleClick = (name: string, code?: string) => {
		const query = code ? `${name} (${code})` : name;
		router.push(`/search?to=${encodeURIComponent(query)}`);
	};

	if (destinations.length === 0) {
		return (
			<section className="py-20">
				<Container>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-10 text-left">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dream Destinations</h2>
						<p className="mt-3 text-muted-foreground">From city breaks to tropical escapes</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="glossy-card rounded-xl flex flex-col items-center justify-center py-16 text-center">
						<div className="rounded-full bg-primary/10 p-4 mb-4">
							<Plane className="h-8 w-8 text-primary" />
						</div>
						<h3 className="text-lg font-semibold">No Destinations Available</h3>
						<p className="mt-2 max-w-sm text-sm text-muted-foreground">
							We couldn't find any popular destinations at the moment. Please check back later or search for a specific destination.
						</p>
						<Button
							onClick={() => router.push('/search')}
							className="mt-6">
							<Search className="mr-2 h-4 w-4" />
							Search for Flights
						</Button>
					</motion.div>
				</Container>
			</section>
		);
	}

	return (
		<section className="py-20">
			<Container>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-10 text-left">
					<h2 className="section-heading">Dream Destinations</h2>
					<p className="mt-3 text-muted-foreground">From city breaks to tropical escapes</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="rounded-2xl border border-border bg-background-card p-6 shadow-sm sm:p-8">
					<div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
						{destinations.map((dest, i) => (
							<motion.button
								key={dest.id}
								type="button"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.08 }}
								onClick={() => handleClick(dest.name, !useMockData && popularAirports.length > 0 ? popularAirports[i]?.iata_code : undefined)}
								className="hover-lift group relative aspect-[4/5] overflow-hidden rounded-xl text-left shadow-lg">
								<Image
									src={dest.image}
									alt={dest.name}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-105"
									unoptimized={dest.image.includes('cloudinary.com')}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

								<div className="absolute inset-x-0 bottom-0 p-4 text-white">
									<h3 className="text-lg font-bold">{dest.name}</h3>
									<p className="text-xs text-white/70">{dest.country}</p>
									{dest.priceFrom && <p className="mt-1 text-sm font-bold text-primary">From {formatFlightPrice(dest.priceFrom, dest.currency)}</p>}
								</div>
							</motion.button>
						))}
					</div>
				</motion.div>
			</Container>
		</section>
	);
}
