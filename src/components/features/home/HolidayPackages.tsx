'use client';

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
					className="mb-10 text-left">
					<span className="section-badge mb-3 inline-flex">Holiday Packages</span>
					<h2 className="section-heading">Curated Getaways</h2>
					<p className="mt-3 text-muted-foreground">All-inclusive escapes at exclusive prices, with flights, stays, and experiences bundled</p>
				</motion.div>

				<div className="grid gap-6 sm:grid-cols-2">
					{packages.map((pkg, i) => (
						<motion.div
							key={pkg.uniqueid}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.08 }}>
							<Link
								href={`/holiday-packages/${pkg.slug}`}
								className="hover-lift group block overflow-hidden rounded-xl border border-border bg-background-card shadow-lg">
								<div className="relative aspect-[2/1] overflow-hidden">
									<Image
										src={pkg.thumbnail}
										alt={pkg.title}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-108"
									/>
								</div>

								<div className="p-5">
									<span className="mb-2 inline-flex rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Featured</span>
									<h3 className="text-xl font-bold text-foreground">{pkg.title}</h3>
									{pkg.subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{pkg.subtitle}</p>}
									<div className="mt-3 flex items-center justify-between">
										<p className="text-lg font-bold text-primary">From {formatFlightPrice(pkg.amount, pkg.currency)}</p>
										<p className="text-xs text-muted-foreground">Per person</p>
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
