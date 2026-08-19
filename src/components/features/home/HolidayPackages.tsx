'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { formatFlightPrice } from '@/services/whitelabel-api';

import type { HolidayPackage } from '@/types/whitelabel';
interface HolidayPackagesProps {
	packages: HolidayPackage[];
}

export function HolidayPackages({ packages }: HolidayPackagesProps) {
	if (packages.length === 0) return null;

	return (
		<section className="py-20">
			<Container>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-10 text-center">
					<span className="section-badge mb-3 inline-flex">Holiday Packages</span>
					<h2 className="section-heading">Curated Getaways</h2>
					<p className="mt-3 text-muted-foreground">All-inclusive escapes at exclusive prices — flights, stays, and experiences bundled</p>
				</motion.div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{packages.map((pkg, i) => (
						<motion.div
							key={pkg.uniqueid}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.08 }}>
							<Link
								href={`/holiday-packages/${pkg.slug}`}
								className="hover-lift group relative block h-72 overflow-hidden rounded-2xl shadow-lg">
								<Image
									src={pkg.thumbnail}
									alt={pkg.title}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-108"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

								<span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink">Featured</span>

								<div className="absolute inset-x-0 bottom-0 p-5 text-white">
									<p className="text-xs uppercase tracking-wider text-white/70">{pkg.location}</p>
									<h3 className="mt-1 text-xl font-bold">{pkg.title}</h3>
									{pkg.subtitle && <p className="mt-1 text-sm text-white/70">{pkg.subtitle}</p>}
									<div className="mt-3 flex items-center justify-between">
										<p className="text-lg font-bold text-primary">From {formatFlightPrice(pkg.amount, pkg.currency)}</p>
										<ArrowRight className="h-4 w-4 text-white/70 transition-colors group-hover:translate-x-0.5 group-hover:text-white" />
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</Container>
		</section>
	);
}
