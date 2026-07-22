'use client';

import { Award, Calendar, HelpCircle, LayoutDashboard, Menu, Plane, Search, Settings, User, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { NavSection, Sidebar } from '@/components/layout/Sidebar';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems: NavSection[] = [
	{
		section: 'Main Menu',
		items: [
			{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
			{ href: '/dashboard/search', label: 'Search Flights', icon: Search },
			{ href: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
		],
	},
	{
		section: 'Account',
		items: [
			{ href: '/dashboard/profile', label: 'Profile', icon: User },
			{ href: '/dashboard/rewards', label: 'Rewards', icon: Award },
		],
	},
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading, logout, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
		}
	}, [isLoading, isAuthenticated, router, pathname]);

	useEffect(() => {
		setIsSidebarOpen(false);
	}, [pathname]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="relative">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
					<div className="absolute inset-0 flex items-center justify-center">
						<Plane className="h-5 w-5 text-primary animate-pulse" />
					</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) return null;

	const displayName = user?.firstName || user?.name || 'Traveler';
	const email = user?.email || '';
	const isExpanded = !isCollapsed || isHovered;
	const sidebarMargin = isExpanded ? 'lg:ml-[280px]' : 'lg:ml-[72px]';

	return (
		<div className="flex min-h-screen">
			{/* Background orbs */}
			<div
				className="dashboard-bg-orbs fixed inset-0"
				aria-hidden="true">
				<div className="dashboard-orb dashboard-orb-primary" />
				<div className="dashboard-orb dashboard-orb-accent" />
				<div className="dashboard-orb dashboard-orb-tertiary" />
			</div>

			{/* Mobile overlay */}
			<div
				className={cn('fixed inset-0 z-40 transition-all duration-300 lg:hidden', isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
				onClick={() => setIsSidebarOpen(false)}>
				<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
			</div>

			{/* Sidebar Component */}
			<Sidebar
				navItems={navItems}
				userName={displayName}
				userEmail={email}
				userAvatar={user?.avatar}
				isCollapsed={isCollapsed}
				onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
				isHovered={isHovered}
				onHoverChange={setIsHovered}
				onLogout={logout}
				isMobileOpen={isSidebarOpen}
			/>

			{/* Right Section: Navbar + Main Content */}
			<div className={cn('flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out', sidebarMargin)}>
				<DashboardNavbar />

				<main className="flex-1 pt-4 pb-8">
					<Container
						size="full"
						className="relative">
						{children}
					</Container>
				</main>
			</div>

			{/* Mobile FAB */}
			<button
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				className={cn(
					'fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 lg:hidden',
					isSidebarOpen && 'rotate-90'
				)}>
				{isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>
		</div>
	);
}
