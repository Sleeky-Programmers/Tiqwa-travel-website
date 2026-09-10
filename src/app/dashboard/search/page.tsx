'use client';

import { Award, Calendar, Clock, Globe, MapPin, Plane, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { FlightSearchForm } from '@/components/features/FlightSearchForm';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

export default function DashboardSearchPage() {
	const router = useRouter();

	const quickTips = [
		{
			icon: Plane,
			title: 'Best Price Guarantee',
			description: 'We match any lower price',
			color: 'from-blue-500 to-blue-600',
			bg: 'bg-blue-50 dark:bg-blue-900/20',
			iconColor: 'text-blue-500',
		},
		{
			icon: Calendar,
			title: 'Flexible Dates',
			description: 'Search multiple dates at once',
			color: 'from-emerald-500 to-emerald-600',
			bg: 'bg-emerald-50 dark:bg-emerald-900/20',
			iconColor: 'text-emerald-500',
		},
		{
			icon: Globe,
			title: '500+ Destinations',
			description: 'Fly to cities worldwide',
			color: 'from-purple-500 to-purple-600',
			bg: 'bg-purple-50 dark:bg-purple-900/20',
			iconColor: 'text-purple-500',
		},
	];

	const features = [
		{
			icon: Sparkles,
			title: 'Smart Search',
			description: 'AI-powered flight recommendations',
		},
		{
			icon: Clock,
			title: 'Real-time Updates',
			description: 'Live flight status and availability',
		},
		{
			icon: Award,
			title: 'Earn Rewards',
			description: 'Get points on every booking',
		},
	];

	return (
		<div className="space-y-7 page-transition">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Search Flights</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<MapPin className="h-4 w-4" />
						Find and book your next flight
					</p>
				</div>
				<div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
					</span>
					500+ destinations
				</div>
			</div>

			{/* Search Form Card - Light mode: solid white with shadow, Dark mode: glass */}
			<div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
				{/* Decorative gradient */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500" />
				<div className="p-6 sm:p-8">
					<FlightSearchForm />
				</div>
			</div>

			{/* Quick Tips */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">Quick Tips</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Make the most of your search</p>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{quickTips.map((tip, index) => (
						<div
							key={index}
							className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
							<div
								className={cn('mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-lg', tip.bg)}>
								<tip.icon className={cn('h-7 w-7', tip.iconColor)} />
							</div>
							<h3 className="font-semibold">{tip.title}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
							<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
						</div>
					))}
				</div>
			</div>

			{/* Features Section */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-semibold">Why Book With Us</h2>
					<p className="text-xs text-muted-foreground mt-0.5">Premium features for a seamless experience</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-3">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<feature.icon className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-semibold text-sm">{feature.title}</h3>
								<p className="text-xs text-muted-foreground">{feature.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* CTA Card */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-7 backdrop-blur-xl dark:from-primary/20">
				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

				<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
							<Plane className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 className="text-lg font-bold">Ready to Take Off?</h3>
							<p className="text-sm text-muted-foreground">Enter your destination above and start your journey</p>
						</div>
					</div>
					<button
						onClick={() => {
							const form = document.querySelector('form');
							if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
						}}
						className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105">
						Search Now
						<Plane className="ml-2 inline h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
