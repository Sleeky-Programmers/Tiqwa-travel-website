import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: HeadingLevel;
	as?: HeadingLevel;
	weight?: 'normal' | 'medium' | 'semibold' | 'bold';
	gradient?: boolean;
}

const headingStyles: Record<HeadingLevel, string> = {
	h1: 'text-3xl sm:text-4xl font-bold tracking-tight',
	h2: 'text-2xl sm:text-3xl font-bold tracking-tight',
	h3: 'text-xl sm:text-2xl font-semibold tracking-tight',
	h4: 'text-lg sm:text-xl font-semibold',
};

const weightStyles = {
	normal: 'font-normal',
	medium: 'font-medium',
	semibold: 'font-semibold',
	bold: 'font-bold',
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(({ className, level = 'h1', as, weight = 'bold', gradient = false, children, ...props }, ref) => {
	const Component = as || level;
	return (
		<Component
			ref={ref}
			className={cn(headingStyles[level], weightStyles[weight], gradient && 'gradient-text-primary', className)}
			{...props}>
			{children}
		</Component>
	);
});

Heading.displayName = 'Heading';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
	variant?: 'default' | 'muted' | 'small' | 'large';
}

const textStyles = {
	default: 'text-base text-foreground',
	muted: 'text-sm text-muted-foreground',
	small: 'text-sm text-foreground',
	large: 'text-lg text-foreground',
};

export const Text = forwardRef<HTMLParagraphElement, TextProps>(({ className, variant = 'default', children, ...props }, ref) => {
	return (
		<p
			ref={ref}
			className={cn(textStyles[variant], className)}
			{...props}>
			{children}
		</p>
	);
});

Text.displayName = 'Text';
