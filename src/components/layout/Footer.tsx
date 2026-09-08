'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { Container } from '@/components/ui/Container';
import { Link as FooterLink } from '@/components/ui/Link';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { decodeHtmlEntities } from '@/lib/utils';

const footerLinks = {
	Company: [
		{ href: '/contact', label: 'Contact' },
		{ href: '/faq', label: 'FAQ' },
	],
	Legal: [
		{ href: '/terms', label: 'Terms of Service' },
		{ href: '/privacy', label: 'Privacy Policy' },
	],
	Explore: [
		{ href: '/search', label: 'Search Flights' },
		{
			href: '/results?from=New+York&to=London&departure=2026-07-01&passengers=1',
			label: 'Popular Routes',
		},
	],
};

const DEFAULT_TAGLINE = 'Your gateway to the world. Find and book flights to over 500 destinations with the best prices guaranteed.';

export function Footer() {
	const { settings } = useSiteSettings();

	const brandName = settings?.long_name || settings?.name || 'Tiqwa Travel';
	const tagline = settings?.tagline || DEFAULT_TAGLINE;
	const phone = settings?.support_phone || settings?.phone_number;
	const email = settings?.support_email || settings?.email_address;
	const copyright = settings?.copyright ? decodeHtmlEntities(settings.copyright) : `© ${new Date().getFullYear()} Tiqwa Travel. All rights reserved.`;

	const socialLinks = [
		{ href: settings?.twitter_link, label: 'Twitter', Icon: FaXTwitter },
		{ href: settings?.instagram_link, label: 'Instagram', Icon: FaInstagram },
		{ href: settings?.facebook_link, label: 'Facebook', Icon: FaFacebook },
		{ href: settings?.linkedin_link, label: 'LinkedIn', Icon: FaLinkedin },
		{
			href: settings?.support_email || settings?.email_address ? `mailto:${settings?.support_email || settings?.email_address}` : undefined,
			label: 'Email',
			Icon: Mail,
		},
	].filter((link): link is { href: string; label: string; Icon: typeof Mail } => Boolean(link.href));

	return (
		<footer className="mt-auto band-dark">
			<Container className="py-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand Column */}
					<div className="lg:col-span-2 flex flex-col gap-5">
						<Link
							href="/"
							className="flex items-center gap-2.5 group w-fit">
							<BrandLogo
								name={brandName}
								className="text-lg text-ink-foreground transition-colors group-hover:text-primary"
							/>
						</Link>

						<p className="text-sm leading-relaxed max-w-xs text-ink-muted">{tagline}</p>

						<div className="flex flex-col gap-2 text-sm text-ink-muted">
							{settings?.physical_address && (
								<p className="flex items-start gap-2 leading-relaxed max-w-xs">
									<MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
									{settings.physical_address}
								</p>
							)}
							{phone && (
								<p className="flex items-center gap-2">
									<Phone className="h-4 w-4 shrink-0 text-primary" />
									{phone}
								</p>
							)}
							{email && (
								<p className="flex items-center gap-2">
									<Mail className="h-4 w-4 shrink-0 text-primary" />
									{email}
								</p>
							)}
						</div>

						{/* Social Icons */}
						{socialLinks.length > 0 && (
							<div className="flex items-center gap-2 mt-1">
								{socialLinks.map(({ href, label, Icon }) => (
									<a
										key={label}
										href={href}
										aria-label={label}
										target="_blank"
										rel="noopener noreferrer"
										className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-border text-ink-muted transition-all duration-200 hover:border-primary/50 hover:bg-primary/15 hover:text-primary hover:scale-110">
										<Icon className="h-3.5 w-3.5" />
									</a>
								))}
							</div>
						)}
					</div>

					{/* Link Columns */}
					{Object.entries(footerLinks).map(([title, links]) => (
						<div
							key={title}
							className="flex flex-col gap-4">
							<h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{title}</h4>
							<ul className="space-y-2.5">
								{links.map((link) => (
									<li key={link.href}>
										<FooterLink
											href={link.href}
											variant="footer"
											className="text-ink-muted hover:text-primary">
											{link.label}
										</FooterLink>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Container>

			{/* Bottom bar */}
			<div className="border-t border-ink-border">
				<Container className="py-4">
					<div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
						<p className="text-xs text-ink-muted">{copyright}</p>
						<p className="text-xs text-ink-muted">Made with ♥ for travelers everywhere</p>
					</div>
				</Container>
			</div>
		</footer>
	);
}
