'use client';

import Image from 'next/image';
import Link from 'next/link';

import { BrandLogo } from '@/components/layout/BrandLogo';

import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

interface AuthLayoutProps {
	image: string | StaticImageData;
	headline: ReactNode;
	subtext: string;
	badges: string[];
	children: ReactNode;
}

export function AuthLayout({ image, headline, subtext, badges, children }: AuthLayoutProps) {
	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			{/* Left panel — image + headline, hidden below lg */}
			<div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-10">
				<Image
					src={image}
					alt=""
					fill
					priority
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

				<Link
					href="/"
					className="relative z-10 flex items-center gap-2">
					<BrandLogo className="text-lg text-white" />
				</Link>

				<div className="relative z-10">
					<h1 className="max-w-md text-4xl font-extrabold leading-tight text-white sm:text-5xl">{headline}</h1>
					<p className="mt-5 max-w-sm text-white/80">{subtext}</p>

					<div className="mt-10 flex items-center gap-6 border-t border-white/15 pt-6">
						{badges.map((badge) => (
							<span
								key={badge}
								className="text-xs font-medium text-white/75">
								{badge}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Right panel — form */}
			<div className="flex items-center justify-center p-6 sm:p-12">
				<div className="w-full max-w-md">{children}</div>
			</div>
		</div>
	);
}
