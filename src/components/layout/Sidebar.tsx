'use client';

import { Award, Calendar, ChevronLeft, ChevronRight, HelpCircle, Home, LayoutDashboard, LogOut, Search, Settings, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { Link } from '@/components/ui/Link';
import { cn } from '@/lib/utils';

export interface NavItem {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	exact?: boolean;
}

export interface NavSection {
	section: string;
	items: NavItem[];
}

export interface SidebarProps {
	/** Navigation sections with items */
	navItems: NavSection[];
	/** Current user's name for display */
	userName?: string;
	/** User's email for display */
	userEmail?: string;
	/** User's avatar URL */
	userAvatar?: string;
	/** Whether sidebar is collapsed */
	isCollapsed: boolean;
	/** Toggle collapse state */
	onToggleCollapse: () => void;
	/** Whether sidebar is in hovered state (for collapse expansion) */
	isHovered: boolean;
	/** Set hover state */
	onHoverChange: (hovered: boolean) => void;
	/** Logout function */
	onLogout: () => void;
	/** Whether the sidebar drawer is open on mobile/tablet viewports */
	isMobileOpen?: boolean;
	/** Optional additional className */
	className?: string;
}

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
	if (exact) return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string): string {
	return name
		.split(' ')
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export function Sidebar({
	navItems,
	userName = 'User',
	userEmail = '',
	userAvatar,
	isCollapsed,
	onToggleCollapse,
	isHovered,
	onHoverChange,
	onLogout,
	isMobileOpen = false,
	className,
}: SidebarProps) {
	const pathname = usePathname();
	const isExpanded = !isCollapsed || isHovered;
	const displayName = userName || 'User';

	return (
		<aside
			className={cn(
				'fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out',
				isExpanded ? 'w-[280px]' : 'w-[72px]',
				isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
				className
			)}
			onMouseEnter={() => isCollapsed && onHoverChange(true)}
			onMouseLeave={() => isCollapsed && onHoverChange(false)}>
			<div className="dashboard-sidebar flex h-full flex-col overflow-hidden">
				{/* Brand header */}
				<div
					className={cn(
						'border-b border-white/40 dark:border-white/10 px-4 py-4 flex-shrink-0',
						isExpanded ? 'flex items-center justify-between' : 'flex justify-center'
					)}>
					{isExpanded ? (
						<>
							<div className="flex items-center gap-2.5">
								<div>
									<BrandLogo className="text-sm leading-none text-foreground" />
									<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Premium</p>
								</div>
							</div>
							<button
								onClick={onToggleCollapse}
								className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
								aria-label="Toggle sidebar collapse">
								<ChevronLeft className="h-4 w-4" />
							</button>
						</>
					) : (
						<button
							onClick={() => onToggleCollapse()}
							className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
							aria-label="Expand sidebar">
							<ChevronRight className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* User Profile (when expanded) */}
				{isExpanded && (userName || userEmail) && (
					<div className="border-b border-white/40 dark:border-white/10 px-4 py-4 flex-shrink-0">
						<div className="flex items-center gap-3">
							<div className="relative flex-shrink-0">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-hover text-sm font-bold leading-none text-white shadow-lg ring-2 ring-primary/20">
									{userAvatar ? (
										<img
											src={userAvatar}
											alt={displayName}
											className="h-full w-full object-cover"
										/>
									) : (
										<span className="select-none">{getInitials(displayName)}</span>
									)}
								</div>
								<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-800" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold leading-none">{displayName}</p>
								{userEmail && <p className="mt-1 truncate text-xs text-muted-foreground">{userEmail}</p>}
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto px-3 py-4 thin-scroll">
					{navItems.map((section) => (
						<div
							key={section.section}
							className="mb-4 last:mb-0">
							{isExpanded && (
								<div className="px-3 pb-2">
									<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{section.section}</p>
								</div>
							)}
							<div className="space-y-0.5">
								{section.items.map((item) => {
									const active = isNavActive(pathname, item.href, item.exact);
									return (
										<Link
											key={item.href}
											href={item.href}
											variant="sidebar"
											active={active}
											className={!isExpanded ? 'justify-center px-2' : undefined}
											title={!isExpanded ? item.label : undefined}>
											<item.icon
												className={cn('h-4 w-4 shrink-0 transition-all duration-200', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
											/>
											{isExpanded && <span>{item.label}</span>}
											{isExpanded && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</nav>

				{/* Footer: Sign Out + Back to Home */}
				<div className={cn('border-t border-white/40 dark:border-white/10 p-3 space-y-0.5 flex-shrink-0', !isExpanded && 'flex flex-col items-center px-2')}>
					<button
						type="button"
						onClick={onLogout}
						className={cn(
							'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive/80 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive',
							!isExpanded && 'justify-center px-2'
						)}
						title={!isExpanded ? 'Sign Out' : undefined}>
						<LogOut className="h-4 w-4" />
						{isExpanded && <span className="transition-transform duration-150 group-hover:translate-x-0.5">Sign Out</span>}
					</button>

					<Link
						href="/"
						variant="sidebar"
						className={cn('text-muted-foreground/70', !isExpanded && 'justify-center px-2')}
						title={!isExpanded ? 'Back to Home' : undefined}>
						<Home className="h-4 w-4" />
						{isExpanded && <span>Back to Home</span>}
					</Link>
				</div>
			</div>
		</aside>
	);
}
