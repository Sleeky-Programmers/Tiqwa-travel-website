// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
	className?: string;
	variant?: 'text' | 'circle' | 'rect' | 'card';
	width?: string | number;
	height?: string | number;
}

const variantStyles = {
	text: 'h-4 rounded',
	circle: 'rounded-full',
	rect: 'rounded-md',
	card: 'rounded-xl',
};

export function Skeleton({ className, variant = 'text', width, height, ...props }: SkeletonProps) {
	return (
		<div
			className={cn('skeleton', variantStyles[variant], className)}
			style={{
				width: typeof width === 'number' ? `${width}px` : width,
				height: typeof height === 'number' ? `${height}px` : height,
				...(variant === 'text' && !height && { height: '1rem' }),
				...(variant === 'circle' && !height && { width: '2.5rem', height: '2.5rem' }),
			}}
			{...props}
		/>
	);
}

// import { cn } from "@/lib/utils";

// export function Skeleton({ className }: { className?: string }) {
//   return (
//     <div className={cn("animate-pulse rounded-xl bg-muted/50", className)} />
//   );
// }
