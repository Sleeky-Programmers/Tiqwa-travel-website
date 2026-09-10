import { cva, VariantProps } from 'class-variance-authority';
import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';

import { cn } from '@/lib/utils';

const linkVariants = cva('outline-none transition-all duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm', {
	variants: {
		variant: {
			/** Inline text link — primary color, underline on hover. */
			'default': 'text-primary underline-offset-4 hover:underline',
			/** Muted inline link that picks up the accent color on hover. */
			'muted': 'text-muted-foreground hover:text-primary',
			/** Pill-shaped nav item; combine with `active` for the current-route state. */
			'nav': 'rounded-full px-4 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/6',
			/** Footer link list — muted, with a small hover-shift on the label. */
			'footer': 'group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary',
			/** "← Back to X" navigation link — renders its own arrow icon. */
			'back': 'group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary',
			/** Vertical sidebar nav item (icon + label); combine with `active` for the current-route state. */
			'sidebar':
				'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/60 hover:bg-primary/5 hover:text-foreground hover:translate-x-0.5',
			/** Dropdown / overflow menu item — icon + label row inside a popover or menu panel. */
			'menu-item': 'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-primary/5 hover:text-foreground',
			/** Unstyled — inherits surrounding text styles entirely. */
			'plain': '',
		},
		active: {
			true: '',
			false: '',
		},
	},
	compoundVariants: [
		{
			variant: 'nav',
			active: true,
			className: 'bg-primary/12 text-primary shadow-sm shadow-primary/10 hover:bg-primary/18 hover:text-primary',
		},
		{
			variant: 'sidebar',
			active: true,
			className: 'sidebar-active-bar bg-primary/10 text-primary shadow-sm hover:translate-x-0',
		},
	],
	defaultVariants: { variant: 'default', active: false },
});

type LinkVariants = VariantProps<typeof linkVariants>;

interface LinkProps extends Omit<React.ComponentProps<typeof NextLink>, 'href'>, LinkVariants {
	href: string;
}

function Link({ className, variant = 'default', active = false, children, ...props }: LinkProps) {
	if (variant === 'footer') {
		return (
			<NextLink
				data-slot="link"
				className={cn(linkVariants({ variant, active, className }))}
				{...props}>
				<span className="transition-transform duration-200 group-hover:translate-x-0.5">{children}</span>
			</NextLink>
		);
	}

	if (variant === 'back') {
		return (
			<NextLink
				data-slot="link"
				className={cn(linkVariants({ variant, active, className }), 'hover:gap-3')}
				{...props}>
				<ArrowLeft className="h-4 w-4 shrink-0" />
				{children}
			</NextLink>
		);
	}

	return (
		<NextLink
			data-slot="link"
			className={cn(linkVariants({ variant, active, className }))}
			{...props}>
			{children}
		</NextLink>
	);
}

export { Link, linkVariants };
export type { LinkProps };
