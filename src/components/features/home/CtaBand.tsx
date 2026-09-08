'use client';

import { Clock3, PlaneTakeoff, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { imageFixes } from '@/utils/images';

export function CtaBand() {
	return (
		<section className="band-dark py-20">
			<Container>
				<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="relative h-64 overflow-hidden rounded-xl sm:h-80 lg:h-96">
						<Image
							src={imageFixes.landingCta}
							alt="Premium destinations"
							fill
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
						<span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
							<PlaneTakeoff className="h-3.5 w-3.5" />
							Premium destinations
						</span>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
							<PlaneTakeoff className="h-6 w-6" />
						</div>
						<h2 className="text-3xl font-extrabold tracking-tight text-ink-foreground sm:text-4xl">Ready to take off?</h2>
						<p className="mt-3 text-ink-muted">Search hundreds of airlines in seconds and book your next adventure with confidence.</p>
						<Button
							href="/search"
							size="lg"
							className="mt-8">
							Search Flights
						</Button>

						<div className="mt-6 flex flex-wrap items-center gap-5">
							<span className="flex items-center gap-1.5 text-xs text-ink-muted">
								<ShieldCheck className="h-3.5 w-3.5 text-primary" />
								Secure booking
							</span>
							<span className="flex items-center gap-1.5 text-xs text-ink-muted">
								<Clock3 className="h-3.5 w-3.5 text-primary" />
								24/7 support
							</span>
						</div>
					</motion.div>
				</div>
			</Container>
		</section>
	);
}
