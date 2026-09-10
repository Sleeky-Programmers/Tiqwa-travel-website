// components/ui/Card.tsx
import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'glass' | 'bordered' | 'elevated';
	hover?: boolean;
	padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingStyles = {
	none: 'p-0',
	sm: 'p-3',
	md: 'p-4 sm:p-5',
	lg: 'p-5 sm:p-6',
	xl: 'p-6 sm:p-8',
};

const variantStyles = {
	default: 'bg-background-card border border-border shadow-sm',
	glass: 'bg-glass-bg backdrop-blur-xl border border-glass-border shadow-glass',
	bordered: 'bg-transparent border border-border',
	elevated: 'bg-background-card border border-border shadow-md hover:shadow-lg transition-shadow',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant = 'default', hover = true, padding = 'lg', children, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				'rounded-xl transition-all duration-200',
				variantStyles[variant],
				paddingStyles[padding],
				hover && 'hover:shadow-lg hover:-translate-y-0.5',
				className
			)}
			{...props}>
			{children}
		</div>
	);
});

Card.displayName = 'Card';

// import { type HTMLAttributes } from "react";

// interface CardProps extends HTMLAttributes<HTMLDivElement> {
//   hover?: boolean;
// }

// export function Card({ hover = true, className = "", children, ...props }: CardProps) {
//   return (
//     <div
//       className={`glossy rounded-2xl p-6 ${hover ? "glossy-hover" : ""} ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// }
