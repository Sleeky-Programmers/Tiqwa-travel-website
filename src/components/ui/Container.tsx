import { HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
	size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const sizeStyles = {
	'sm': 'max-w-5xl',
	'md': 'max-w-6xl',
	'lg': 'max-w-7xl',
	'xl': 'max-w-7xl',
	'2xl': 'w-full',
	'full': 'w-full',
};

export function Container({ size = 'lg', className = '', children, ...props }: ContainerProps) {
	return (
		<div
			className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}
			{...props}>
			{children}
		</div>
	);
}
