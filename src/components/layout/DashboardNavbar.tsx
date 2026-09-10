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
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);
	const notificationsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
			if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
				setIsNotificationsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const notifications = [
		{ id: 1, title: 'Flight Confirmed', message: 'Lagos → Enugu on July 30th', time: '2 min ago', icon: Plane, color: 'text-blue-500' },
		{ id: 2, title: 'Rewards Points', message: 'You earned 500 points', time: '1 hour ago', icon: Gift, color: 'text-amber-500' },
		{ id: 3, title: 'Upcoming Trip', message: 'Enugu → Abuja in 3 days', time: '5 hours ago', icon: Calendar, color: 'text-emerald-500' },
	];

	return (
		<header className="dashboard-navbar flex-shrink-0 border-b border-white/40 dark:border-white/10 relative z-40">
			<div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				{/* Left: Logo + breadcrumb */}
				<div className="flex items-center gap-3 min-w-0">
					{breadcrumb && (
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
							<ChevronRight className="h-3.5 w-3.5 opacity-30" />
							<Link
								href="/dashboard"
								className="flex items-center gap-1 hover:text-primary transition-colors">
								<Home className="h-3 w-3" />
								<span className="hidden sm:inline">Dashboard</span>
							</Link>
							{pathname !== '/dashboard' && (
								<>
									<ChevronRight className="h-3.5 w-3.5 opacity-30" />
									<span className="font-medium text-foreground/80 hidden sm:inline">{breadcrumb}</span>
								</>
							)}
						</div>
					)}
				</div>

				{/* Right: Actions */}
				<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
					{/* Search shortcut */}
					<Link
						href="/dashboard/search"
						className="hidden items-center gap-2 rounded-full border border-border/40 bg-white/60 px-4 py-1.5 text-xs font-medium text-foreground/60 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary sm:flex dark:bg-white/5">
						<Search className="h-3.5 w-3.5" />
						<span>Search flights...</span>
						<kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
							⌘K
						</kbd>
					</Link>

					{/* Theme toggle */}
					{mounted && (
						<button
							type="button"
							onClick={toggleTheme}
							aria-label="Toggle theme"
							className="rounded-full border border-border/40 bg-white/60 p-2 text-foreground/70 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:bg-white/5">
							{theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
						</button>
					)}

					<div className="hidden h-6 w-px bg-border/40 md:block" />

					{/* User menu */}
					<div
						className="relative"
						ref={userMenuRef}>
						<button
							type="button"
							onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
							className="flex items-center gap-2.5 rounded-full border border-border/40 bg-white/60 py-1 pl-1 pr-3 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 dark:bg-white/5">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-semibold leading-none text-white shadow-sm ring-2 ring-primary/20">
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
							<div className="hidden min-w-0 md:block text-left">
								<p className="truncate text-sm font-medium leading-none">{displayName}</p>
								<p className="truncate text-[10px] text-muted-foreground">{email}</p>
							</div>
							<ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200', isUserMenuOpen && 'rotate-180')} />
						</button>

						{isUserMenuOpen && (
							<div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/40 bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl dark:bg-gray-900/90 z-[9999]">
								<div className="flex flex-col items-center gap-2 border-b border-border/40 px-3 py-3 text-center">
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
										href="/faq"
										variant="menu-item"
										onClick={() => setIsUserMenuOpen(false)}>
										<HelpCircle className="h-4 w-4" />
										Help Center
									</MenuLink>
								</div>

								<div className="border-t border-border/40 pt-1">
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
