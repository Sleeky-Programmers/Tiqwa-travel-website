import { Calendar, CheckCircle2, MapPin } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Link } from '@/components/ui/Link';
import { formatFlightPrice, getHolidayPackageDetails } from '@/services/whitelabel-api';

interface PageProps {
	params: Promise<{ slug: string }>;
}

// `properties` has no fixed shape from the API (null on every package we've seen so far) —
// render it defensively if a future package ever populates it, instead of ignoring the field.
function normalizeHighlights(properties: unknown): string[] {
	if (!properties) return [];
	if (Array.isArray(properties)) return properties.map(String).filter(Boolean);
	if (typeof properties === 'object') {
		return Object.entries(properties as Record<string, unknown>)
			.filter(([, value]) => value !== null && value !== undefined && value !== '')
			.map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`);
	}
	return [String(properties)];
}

function formatListedDate(iso?: string): string | null {
	if (!iso) return null;
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default async function HolidayPackageDetailsPage({ params }: PageProps) {
	const { slug } = await params;
	const result = await getHolidayPackageDetails(slug);

	if (!result.success || !result.data) {
		notFound();
	}

	const { package: pkg, related_packages } = result.data;
	const bodyHtml = pkg.long_description || pkg.description;
	const highlights = normalizeHighlights(pkg.properties);
	const listedDate = formatListedDate(pkg.created_at);

	return (
		<PublicLayout>
			<div className="page-fade-in">
				{/* Hero */}
				<div className="relative h-[45vh] min-h-[320px] w-full">
					<Image
						src={pkg.thumbnail}
						alt={pkg.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
					<Container className="absolute inset-x-0 bottom-0 pb-8 text-white">
						<p className="flex items-center gap-1.5 text-sm text-white/80">
							<MapPin className="h-4 w-4" />
							{pkg.location}
						</p>
						<h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{pkg.title}</h1>
						{pkg.subtitle && <p className="mt-2 text-white/80">{pkg.subtitle}</p>}
					</Container>
				</div>

				<Container className="py-12">
					<Link
						href="/"
						variant="back">
						Back to Home
					</Link>

					<div className="mt-6 grid gap-10 lg:grid-cols-3">
						{/* Description */}
						<div className="space-y-6 lg:col-span-2">
							<div className="space-y-4">
								<h2 className="text-xl font-bold">About this package</h2>
								{bodyHtml ? (
									<div
										className="prose prose-sm max-w-none text-muted-foreground"
										// Trusted CMS-authored content from our own backend admin, not arbitrary user input.
										dangerouslySetInnerHTML={{ __html: bodyHtml }}
									/>
								) : (
									<p className="text-muted-foreground">No description available for this package yet.</p>
								)}
							</div>

							{highlights.length > 0 && (
								<div className="space-y-3">
									<h2 className="text-xl font-bold">Package Highlights</h2>
									<ul className="space-y-2">
										{highlights.map((item, i) => (
											<li
												key={i}
												className="flex items-start gap-2 text-sm text-muted-foreground">
												<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
												{item}
											</li>
										))}
									</ul>
								</div>
							)}

							{listedDate && (
								<p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
									<Calendar className="h-3.5 w-3.5" />
									Listed since {listedDate}
								</p>
							)}
						</div>

						{/* Price / CTA */}
						<div>
							<div className="sticky top-24 rounded-2xl border border-border bg-background-card p-6 shadow-lg">
								<p className="text-sm text-muted-foreground">Starting from</p>
								<p className="text-3xl font-bold text-primary">{formatFlightPrice(pkg.amount, pkg.currency)}</p>
								<Button
									href={`/search?to=${encodeURIComponent(pkg.location)}`}
									className="mt-6 w-full">
									Search Flights to {pkg.location}
								</Button>
							</div>
						</div>
					</div>

					{/* Related packages */}
					{related_packages.length > 0 && (
						<div className="mt-16">
							<h2 className="mb-6 text-xl font-bold">You might also like</h2>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{related_packages.map((related) => (
									<Link
										key={related.uniqueid}
										href={`/holiday-packages/${related.slug}`}
										variant="plain"
										className="hover-lift group relative block h-56 overflow-hidden rounded-2xl shadow-lg">
										<Image
											src={related.thumbnail}
											alt={related.title}
											fill
											className="object-cover transition-transform duration-300 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
										<div className="absolute inset-x-0 bottom-0 p-4 text-white">
											<p className="flex items-center gap-1 text-xs text-white/70">
												<MapPin className="h-3 w-3" />
												{related.location}
											</p>
											<h3 className="font-bold">{related.title}</h3>
											<p className="text-sm text-white/70">From {formatFlightPrice(related.amount, related.currency)}</p>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</Container>
			</div>
		</PublicLayout>
	);
}
