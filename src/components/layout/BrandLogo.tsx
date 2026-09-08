'use client';

import Link from 'next/link';

import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const DEFAULT_BRAND_NAME = 'Tiqwa Travel';

interface BrandLogoProps {
	className?: string;
	name?: string;
	href?: string | null;
}

export function BrandLogo({ className = '', name, href }: BrandLogoProps) {
	const { settings } = useSiteSettings();
	const brandName = name || settings?.name || DEFAULT_BRAND_NAME;
	const fourIndex = brandName.indexOf('4');

	const wordmark =
		fourIndex === -1 ? (
			brandName
		) : (
			<>
				{brandName.slice(0, fourIndex)}
				<span className="text-primary">4</span>
				{brandName.slice(fourIndex + 1)}
			</>
		);

	const content = <span className={`font-heading font-extrabold ${className}`}>{wordmark}</span>;

	return href ? <Link href={href}>{content}</Link> : content;
}
