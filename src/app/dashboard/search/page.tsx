'use client';

import { Award, Calendar, Clock, Globe, Plane, Sparkles, Star } from 'lucide-react';

import { FlightSearchForm } from '@/components/features/FlightSearchForm';
import { cn } from '@/lib/utils';

export default function DashboardSearchPage() {
	const quickTips = [
		{
			icon: Star,
			title: 'Best Price Guarantee',
			description: 'We match any lower price found',
			chip: 'bg-primary-light text-primary dark:bg-primary/15',
		},
		{
			icon: Calendar,
			title: 'Flexible Dates',
			description: 'Search multiple dates at once',
			chip: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15',
		},
		{
			icon: Globe,
			title: '500+ Destinations',
			description: 'Fly to major cities worldwide',
			chip: 'bg-purple-50 text-purple-500 dark:bg-purple-500/15',
		},
	];

	const features = [
		{
			icon: Sparkles,
			title: 'Smart Search',
			description: 'AI-powered flight recommendations',
			chip: 'bg-primary-light text-primary dark:bg-primary/15',
		},
		{
			icon: Clock,
			title: 'Real-time Updates',
			description: 'Live flight status & tracking',
			chip: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15',
		},
		{
			icon: Award,
			title: 'Earn Rewards',
			description: 'Get points on every booking',
			chip: 'bg-amber-50 text-amber-500 dark:bg-amber-500/15',
		},
	];

	return (
		<div className="space-y-7 animate-fade-in">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Search Flights</h1>
				<p className="mt-1 text-xs text-muted-foreground">Find and book your next flight</p>
			</div>

			{/* Search card — flat, compact */}
			<div className="dc-card p-4 sm:p-6">
				<div className="dc-search-surface">
					<FlightSearchForm />
				</div>
			</div>

			{/* Quick Tips */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Quick Tips</h2>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{quickTips.map((tip) => (
						<div
							key={tip.title}
							className="dc-card group p-5 text-center transition-shadow hover:shadow-md">
							<div className={cn('dc-icon-chip mx-auto mb-3 h-11 w-11', tip.chip)}>
								<tip.icon className="h-5 w-5" />
							</div>
							<h3 className="text-sm font-semibold">{tip.title}</h3>
							<p className="mt-1 text-xs text-muted-foreground">{tip.description}</p>
						</div>
					))}
				</div>
			</div>

			{/* Why Book With Us */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Why Book With Us</h2>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="dc-card flex items-center gap-3.5 p-4 transition-shadow hover:shadow-md">
							<div className={cn('dc-icon-chip h-10 w-10', feature.chip)}>
								<feature.icon className="h-4.5 w-4.5" />
							</div>
							<div className="min-w-0">
								<h3 className="text-sm font-semibold">{feature.title}</h3>
								<p className="truncate text-xs text-muted-foreground">{feature.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Navy CTA band */}
			<div className="dc-cta relative overflow-hidden p-6 sm:p-7">
				<div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h3 className="text-lg font-bold">Ready to Take Off?</h3>
						<p className="mt-1 text-sm text-[var(--ink-muted)]">Enter your destination above and start your journey</p>
					</div>
					<button
						type="button"
						onClick={() => {
							const form = document.querySelector('form');
							if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
						}}
						className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-sm transition-all hover:bg-white/90">
						Search Now
					</button>
				</div>
			</div>
		</div>
	);
}
