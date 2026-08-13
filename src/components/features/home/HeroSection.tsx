'use client';

import { CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

import { FlightSearchForm } from '@/components/features/FlightSearchForm';
import { Container } from '@/components/ui/Container';
import { trustBadges } from '@/data/mockData';
import { heroBackgroundImage } from '@/utils/images';

interface HeroSectionProps {
	heroImage?: string;
}

export function HeroSection({ heroImage }: HeroSectionProps) {
	const backgroundImage = heroImage || heroBackgroundImage;

	return (
		<section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-28">
			{/* Background Image — desktop/tablet only */}
			<div className="absolute inset-0 z-0 hidden md:block">
				<Image
					src={backgroundImage}
					alt="Travel background"
					fill
					className="object-cover"
					priority
					unoptimized={backgroundImage.includes('cloudinary.com')}
				/>
				{/* Gradient overlay — tapers smoothly to white at bottom */}
				<div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/20" />
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/60 to-transparent" />
			</div>

			{/* Solid background with decorative blobs — mobile only, matches dashboard-bg-orbs */}
			<div
				className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-background md:hidden"
				aria-hidden="true">
				<div className="dashboard-orb dashboard-orb-primary" />
				<div className="dashboard-orb dashboard-orb-accent" />
				<div className="dashboard-orb dashboard-orb-tertiary" />
			</div>

			<Container className="relative z-10 py-16 lg:py-24">
				{/* Headline block */}
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65 }}
					className="mx-auto max-w-3xl text-center">
					{/* Eyebrow badge */}
					<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-sm md:border-white/25 md:bg-white/12 md:text-white">
						<Sparkles className="h-3.5 w-3.5 text-primary" />
						Now flying 500+ airlines worldwide
					</span>

					<h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl md:text-white">
						Fly Anywhere, <span className="text-primary drop-shadow-[0_0_24px_rgba(255,90,54,0.55)]">Pay Less</span>
					</h1>
					<p className="mt-5 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto md:text-white/80">
						Premium flight booking with the best prices guaranteed with free cancellation, no hidden fees, instant e-tickets.
					</p>

					{/* Trust badge pills */}
					<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
						{trustBadges.map((badge) => (
							<span
								key={badge}
								className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm md:border-white/25 md:bg-white/12 md:text-white">
								<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
								{badge}
							</span>
						))}
					</div>
				</motion.div>

				{/* Search form — overlaps the hero/next-section boundary */}
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.18 }}
					className="relative z-20 mx-auto mt-10 max-w-5xl md:-mb-20">
					<FlightSearchForm />
				</motion.div>
			</Container>

			{/* Scroll-down indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.2 }}
				className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
				<motion.div
					animate={{ y: [0, 6, 0] }}
					transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
					className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground backdrop-blur-sm md:border-white/30 md:bg-white/10 md:text-white/70">
					<ChevronDown className="h-4 w-4" />
				</motion.div>
			</motion.div>
		</section>
	);
}
