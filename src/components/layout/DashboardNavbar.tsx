'use client';

import { Bell, Calendar, ChevronDown, ChevronRight, Gift, HelpCircle, Home, LogOut, Moon, Plane, Search, Settings, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Link as MenuLink, linkVariants } from '@/components/ui/Link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
	return name
		.split(' ')
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function useBreadcrumb(pathname: string): string | null {
	const map: Record<string, string> = {
		'/dashboard': 'Overview',
		'/dashboard/search': 'Search Flights',
		'/dashboard/bookings': 'My Bookings',
		'/dashboard/profile': 'Profile',
		'/dashboard/rewards': 'Rewards',
	};
	return map[pathname] ?? null;
}

export function DashboardNavbar() {
	const { user, logout } = useAuth();
	const { theme, toggleTheme, mounted } = useTheme();
	const pathname = usePathname();
	const displayName = user?.firstName || user?.name || 'User';
	const email = user?.email || '';
	const breadcrumb = useBreadcrumb(pathname);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<header className="dc-navbar flex-shrink-0 relative z-40">
			<div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				{/* Left: breadcrumb — home icon / Dashboard / page */}
				<div className="flex items-center gap-2 text-xs min-w-0">
					<Link
						href="/dashboard"
						className="flex items-center text-muted-foreground transition-colors hover:text-primary"
						aria-label="Dashboard home">
						<Home className="h-3.5 w-3.5" />
					</Link>
					<ChevronRight className="h-3 w-3 text-muted-foreground/40" />
					<Link
						href="/dashboard"
						className="text-muted-foreground transition-colors hover:text-primary whitespace-nowrap">
						Dashboard
					</Link>
					{breadcrumb && pathname !== '/dashboard' && (
						<>
							<ChevronRight className="h-3 w-3 text-muted-foreground/40" />
							<span className="font-medium text-foreground/80 whitespace-nowrap">{breadcrumb}</span>
						</>
					)}
				</div>

				{/* Right: actions */}
				<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
					{/* Search shortcut (kept from current navbar, restyled flat) */}
					<Link
						href="/dashboard/search"
						className="hidden items-center gap-2 rounded-full border border-[var(--dc-border)] px-4 py-1.5 text-xs font-medium text-foreground/60 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary sm:flex">
						<Search className="h-3.5 w-3.5" />
						<span>Search flights...</span>
						<kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-[var(--dc-border)] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
							⌘K
						</kbd>
					</Link>

					{/* Theme toggle (kept) */}
					{mounted && (
						<button
							type="button"
							onClick={toggleTheme}
							aria-label="Toggle theme"
							className="rounded-full border border-[var(--dc-border)] p-2 text-foreground/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
							{theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
						</button>
					)}

					{/* User: "Hi, Name" + avatar (mockup style) */}
					<div
						className="relative"
						ref={userMenuRef}>
						<button
							type="button"
							onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
							className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-all duration-200 hover:bg-primary/5">
							<span className="hidden text-sm text-muted-foreground md:block">Hi,</span>
							<span className="hidden text-sm font-semibold md:block">{displayName}</span>
							<div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-semibold leading-none text-white shadow-sm ring-2 ring-primary/20">
								{user?.avatar ? (
									<img
										src={user.avatar}
										alt={displayName}
										className="h-full w-full object-cover"
									/>
								) : (
									<span className="select-none">{getInitials(displayName)}</span>
								)}
							</div>
							<ChevronDown className={cn('hidden h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 md:block', isUserMenuOpen && 'rotate-180')} />
						</button>

						{isUserMenuOpen && (
							<div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--dc-border)] bg-background-card p-1.5 shadow-2xl z-[9999] dark:bg-gray-900/90">
								<div className="flex flex-col items-center gap-2 border-b border-[var(--dc-border)] px-3 py-3 text-center">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-hover text-base font-bold leading-none text-white shadow-sm ring-2 ring-primary/20">
										{user?.avatar ? (
											<img
												src={user.avatar}
												alt={displayName}
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="select-none">{getInitials(displayName)}</span>
										)}
									</div>
									<div className="w-full min-w-0">
										<p className="truncate text-sm font-semibold">{displayName}</p>
										<p className="truncate text-xs text-muted-foreground">{email}</p>
									</div>
								</div>

								<div className="py-1">
									<MenuLink
										href="/dashboard/profile"
										variant="menu-item"
										onClick={() => setIsUserMenuOpen(false)}>
										<User className="h-4 w-4" />
										Profile
									</MenuLink>
									<MenuLink
										href="/dashboard/profile"
										variant="menu-item"
										onClick={() => setIsUserMenuOpen(false)}>
										<Settings className="h-4 w-4" />
										Settings
									</MenuLink>
									<MenuLink
										href="/dashboard/help-center"
										variant="menu-item"
										onClick={() => setIsUserMenuOpen(false)}>
										<HelpCircle className="h-4 w-4" />
										Help Center
									</MenuLink>
								</div>

								<div className="border-t border-[var(--dc-border)] pt-1">
									<button
										type="button"
										onClick={() => {
											logout();
											setIsUserMenuOpen(false);
										}}
										className={cn(linkVariants({ variant: 'menu-item' }), 'w-full text-destructive/80 hover:bg-destructive/10 hover:text-destructive')}>
										<LogOut className="h-4 w-4" />
										Sign Out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
