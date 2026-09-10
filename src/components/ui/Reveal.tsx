'use client';

import { motion } from 'motion/react';

import type { HTMLMotionProps } from 'motion/react';

interface RevealProps extends HTMLMotionProps<'div'> {
	delay?: number;
	y?: number;
	once?: boolean;
}

export function Reveal({ delay = 0, y = 20, once = true, transition, viewport, ...props }: RevealProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once, amount: 0.2, ...viewport }}
			transition={{ duration: 0.5, delay, ...transition }}
			{...props}
		/>
	);
}
