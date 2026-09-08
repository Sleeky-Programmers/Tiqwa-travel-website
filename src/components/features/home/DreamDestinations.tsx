'use client';

import { Bookmark, MapPin, Plane, Search } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { destinations as mockDestinations } from '@/data/mockData';
import { getDestinationImage } from '@/utils/images';

import type { PopularAirport } from '@/types/whitelabel';
interface DestinationCard {
	id: string;
	name: string;
	country: string;
	image: string;
	tag: string;
	priceFrom?: number;
}

interface DreamDestinationsProps {
	popularAirports?: PopularAirport[];
}

const tags = ['Popular', 'Urban', 'Tropical', 'Culture', 'Adventure', 'Luxury'];

function mapAirportsToDestinations(airports: PopularAirport[]): DestinationCard[] {
	return airports.map((airport, i) => ({
		id: airport.iata_code ?? `airport-${i}`,
		name: airport.city,
		country: airport.country,
		image: typeof airport.image === 'string' ? airport.image : getDestinationImage(airport.city),
		tag: tags[i % tags.length],
	}));
}

export function DreamDestinations({ popularAirports = [] }: DreamDestinationsProps) {
	const router = useRouter();

	const destinations: DestinationCard[] = popularAirports.length > 0 ? mapAirportsToDestinations(popularAirports) : [];

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
						className="mb-10 text-center">
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
							We couldn't find any popular destinationss at the moment. Please check back later or search for a specific destination.
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
					className="mb-10 text-center">
					<span className="section-badge mb-3 inline-flex">Wanderlust</span>
					<h2 className="section-heading">Dream Destinations</h2>
					<p className="mt-3 text-muted-foreground">From city breaks to tropical escapes — your next trip starts here</p>
				</motion.div>

				<div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 lg:auto-rows-[10rem]">
					{destinations.map((dest, i) => (
						<motion.button
							key={dest.id}
							type="button"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.08 }}
							onClick={() => handleClick(dest.name, popularAirports.length > 0 ? popularAirports[i]?.iata_code : undefined)}
							className={`hover-lift group relative col-span-2 overflow-hidden rounded-xl text-left shadow-lg sm:col-span-1 ${
								i === 0 ? 'row-span-2 h-56 lg:h-auto' : 'h-40 lg:h-auto'
							}`}>
							<Image
								src={dest.image}
								alt={dest.name}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								unoptimized={dest.image.includes('cloudinary.com')}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

							<span className="absolute right-3 top-3 rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">{dest.tag}</span>
							<span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
								<Bookmark className="h-3.5 w-3.5" />
							</span>

							<div className="absolute inset-x-0 bottom-0 p-4 text-white">
								<div className="flex items-center gap-1.5 text-white/80">
									<MapPin className="h-3.5 w-3.5" />
									<span className="text-xs font-medium">{dest.country}</span>
								</div>
								<h3 className={`mt-1 font-bold ${i === 0 ? 'text-2xl' : 'text-lg'}`}>{dest.name}</h3>
								{dest.priceFrom && <p className="mt-1 text-sm font-semibold text-primary">From ${dest.priceFrom}</p>}
							</div>
						</motion.button>
					))}
				</div>
			</Container>
		</section>
	);
}
