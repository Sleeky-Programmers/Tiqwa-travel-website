'use client';

import { MessageSquareQuote, Star } from 'lucide-react';
import { motion } from 'motion/react';

import { Container } from '@/components/ui/Container';
import { testimonials } from '@/data/mockData';

export function TestimonialsSection() {
	return (
		<section className="bg-primary/4 dark:bg-primary/8 py-20">
			<Container>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12 text-center">
					<span className="section-badge mb-3 inline-flex">
						<Star className="h-3 w-3 fill-primary" /> Testimonials
					</span>
					<h2 className="section-heading">Loved by Travelers Worldwide</h2>
					<p className="mt-3 text-muted-foreground max-w-xl mx-auto">Join millions of happy travelers who book with Tiqwa</p>
				</motion.div>

				{/* Testimonial cards — quote-wall style */}
				<div className="grid gap-5 sm:grid-cols-2">
					{testimonials.map((t, i) => (
						<motion.div
							key={t.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.08 }}
							className="hover-lift relative flex flex-col overflow-hidden rounded-xl bg-background-card border border-border p-6 shadow-sm">
							{/* Quote watermark */}
							<span className="quote-watermark">&ldquo;</span>

							{/* Star rating */}
							<div className="flex gap-0.5 mb-3 relative z-10">
								{Array.from({ length: 5 }).map((_, idx) => (
									<Star
										key={idx}
										className={`h-3.5 w-3.5 ${idx < t.rating ? 'fill-primary text-primary' : 'text-border'}`}
									/>
								))}
							</div>

							<p className="flex-1 text-sm text-muted-foreground leading-relaxed relative z-10">&ldquo;{t.content}&rdquo;</p>

							<div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4 relative z-10">
								{/* Avatar circle */}
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 text-xs font-bold text-white">
									{t.name.charAt(0)}
								</div>
								<div>
									<p className="text-sm font-semibold leading-none">{t.name}</p>
									<p className="mt-0.5 text-xs text-muted-foreground">{t.role}</p>
								</div>
								<MessageSquareQuote className="ml-auto h-4 w-4 text-primary/25" />
							</div>
						</motion.div>
					))}
				</div>
			</Container>
		</section>
	);
}
