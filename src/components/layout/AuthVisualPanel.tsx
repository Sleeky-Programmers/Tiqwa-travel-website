'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

interface AuthVisualPanelProps {
	image: string | StaticImageData;
	eyebrow?: ReactNode;
	headline: ReactNode;
	description?: ReactNode;
	badges: ReactNode[];
	logo?: ReactNode;
}

export function AuthVisualPanel({ image, eyebrow, headline, description, badges, logo }: AuthVisualPanelProps) {
	return (
		<div className="relative hidden min-h-screen overflow-hidden lg:flex lg:items-center lg:justify-center">
			<motion.div
				initial={{ scale: 1.08, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
				className="absolute inset-0">
				<Image
					src={image}
					alt=""
					fill
					priority
					className="object-cover"
				/>
			</motion.div>
			<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

			<motion.div
				initial={{ opacity: 0, y: -12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}>
				{logo}
			</motion.div>

			<motion.div
				initial={{ opacity: 0, x: -24 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
				className="absolute left-10 top-1/2 w-[calc(100%-5rem)] max-w-md -translate-y-1/2 text-left text-white">
				{eyebrow}
				<h1 className="mt-3 text-4xl font-extrabold">{headline}</h1>
				{description && <p className="mt-5 text-white/80">{description}</p>}
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
				className="absolute bottom-10 left-10 right-10 flex flex-wrap items-center justify-start gap-6 border-t border-white/15 pt-6 text-xs font-bold text-white/75">
				{badges.map((badge, index) => (
					<span
						key={index}
						className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-white">
						{badge}
					</span>
				))}
			</motion.div>
		</div>
	);
}
