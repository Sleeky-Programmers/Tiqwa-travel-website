'use client';

import { Calendar, CreditCard, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { Link as NavLink, linkVariants } from '@/components/ui/Link';
import { cn } from '@/lib/utils';

const navItems = [
	{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
	{ href: '/admin/bookings', label: 'Bookings', icon: Calendar },
	{ href: '/admin/customers', label: 'Customers', icon: Users },
	{ href: '/admin/payments', label: 'Payments', icon: CreditCard, disabled: false },
	{ href: '/admin/settings', label: 'Settings', icon: Settings, disabled: false },
];

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
	if (exact) return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminSidebarProps {
	onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = () => {
		onNavigate?.();
		router.push('/admin/login');
	};

	return (
		<aside className="flex h-full flex-col border-r border-border bg-background/80 backdrop-blur-xl">
			{/* Logo - Fixed at top - Matches public navbar */}
			<div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6">
				<Link
					href="/admin"
					className="flex items-center gap-2 group"
					onClick={onNavigate}>
					<BrandLogo
						href="/admin"
						name="Tiqwa Admin"
						className="text-base text-foreground transition-colors group-hover:text-primary"
					/>
				</Link>
			</div>

			{/* Navigation - Takes remaining space and scrolls */}
			<nav className="flex-1 space-y-1 overflow-y-auto p-4">
				{navItems.map((item) => {
					const active = !item.disabled && isNavActive(pathname, item.href, item.exact);

					if (item.disabled) {
						return (
							<span
								key={item.href}
								className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50"
								title="Coming soon">
								<item.icon className="h-4 w-4" />
								{item.label}
							</span>
						);
					}

					return (
						<NavLink
							key={item.href}
							href={item.href}
							variant="sidebar"
							active={active}
							onClick={onNavigate}>
							<item.icon className="h-4 w-4" />
							{item.label}
						</NavLink>
					);
				})}
			</nav>

			{/* Logout Button - Fixed at bottom */}
			<div className="shrink-0 border-t border-border p-4">
				<button
					type="button"
					onClick={handleLogout}
					className={cn(linkVariants({ variant: 'menu-item' }), 'w-full text-destructive hover:bg-destructive/10 hover:text-destructive')}>
					<LogOut className="h-4 w-4" />
					Logout
				</button>
			</div>
		</aside>
	);
}
