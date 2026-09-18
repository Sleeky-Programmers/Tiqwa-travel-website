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
			<div className="dc-sidebar flex h-full flex-col overflow-hidden">
				{/* Brand header */}
				<div
					className={cn(
						'border-b border-[var(--dc-border)] px-4 py-5 flex-shrink-0',
						isExpanded ? 'flex items-center justify-between' : 'flex justify-center'
					)}>
					{isExpanded ? (
						<>
							<BrandLogo className="text-base leading-none text-foreground" href="/dashboard" />
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

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto px-3 py-5 thin-scroll">
					{navItems.map((section) => (
						<div
							key={section.section}
							className="mb-5 last:mb-0">
							{isExpanded && (
								<div className="px-3 pb-2">
									<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{section.section}</p>
								</div>
							)}
							<div className="space-y-1">
								{section.items.map((item) => {
									const active = isNavActive(pathname, item.href, item.exact);
									return (
										<Link
											key={item.href}
											href={item.href}
											variant="sidebar"
											active={active}
											className={cn(
												'rounded-lg transition-colors hover:translate-x-0 hover:bg-primary/5',
												active && 'dc-nav-active',
												!isExpanded && 'justify-center px-2'
											)}
											title={!isExpanded ? item.label : undefined}>
											<item.icon
												className={cn('h-4 w-4 shrink-0 transition-colors duration-200', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
											/>
											{isExpanded && <span>{item.label}</span>}
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</nav>

				{/* Footer: Back to Home + Sign Out */}
				<div className={cn('border-t border-[var(--dc-border)] p-3 space-y-1 flex-shrink-0', !isExpanded && 'flex flex-col items-center px-2')}>
					<Link
						href="/"
						variant="sidebar"
						className={cn('text-muted-foreground hover:text-foreground hover:bg-primary/5', !isExpanded && 'justify-center px-2')}
						title={!isExpanded ? 'Back to Home' : undefined}>
						<Home className="h-4 w-4" />
						{isExpanded && <span>Back to Home</span>}
					</Link>
					<button
						type="button"
						onClick={onLogout}
						className={cn(
							'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary/90 transition-colors duration-200 hover:bg-primary/5 hover:text-primary',
							!isExpanded && 'justify-center px-2'
						)}
						title={!isExpanded ? 'Sign Out' : undefined}>
						<LogOut className="h-4 w-4" />
						{isExpanded && <span>Sign Out</span>}
					</button>
				</div>
			</div>
		</aside>
	);
}
