'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isLoginPage = pathname === '/admin/login';
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	if (isLoginPage) {
		return <>{children}</>;
	}

	return (
		<div className="dashboard-shell min-h-screen">
			<div
				className="dashboard-bg-orbs"
				aria-hidden="true">
				<div className="dashboard-orb dashboard-orb-primary" />
				<div className="dashboard-orb dashboard-orb-accent" />
			</div>

			{isSidebarOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/40 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
					aria-label="Close sidebar"
				/>
			)}

			<aside
				className={cn(
					'fixed left-0 top-0 z-50 h-screen w-64 transition-transform duration-300 lg:translate-x-0',
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				)}>
				<AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
			</aside>

			<div className="lg:pl-64">
				<AdminHeader
					isSidebarOpen={isSidebarOpen}
					onMenuToggle={() => setIsSidebarOpen((open) => !open)}
				/>
				<main className="relative p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
}
