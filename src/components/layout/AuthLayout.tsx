'use client';

import { Globe2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { AuthVisualPanel } from '@/components/layout/AuthVisualPanel';
import { BrandLogo } from '@/components/layout/BrandLogo';

import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

interface AuthLayoutProps {
	image: string | StaticImageData;
	headline: ReactNode;
	subtext: string;
	badges: string[];
	children: ReactNode;
	footer?: ReactNode;
}

export function AuthLayout({ image, headline, subtext, badges, children, footer }: AuthLayoutProps) {
	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			<AuthVisualPanel
				image={image}
				headline={headline}
				description={subtext}
				badges={badges.map((badge, index) => {
					const Icon = index === 0 ? ShieldCheck : Globe2;

					return (
						<>
							<Icon
								className="h-4 w-4 text-primary"
								aria-hidden="true"
							/>
							{badge}
						</>
					);
				})}
				logo={
					<Link
						href="/"
						className="absolute left-10 top-10 z-10 flex items-center gap-2">
						<BrandLogo className="text-2xl text-white" />
					</Link>
				}
			/>

			{/* Right panel — form */}
			<div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
					className="flex w-full max-w-lg flex-1 flex-col justify-center">
					{children}
				</motion.div>
				{footer && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="w-full max-w-lg shrink-0 pt-6">
						{footer}
					</motion.div>
				)}
			</div>
		</div>
	);
}
