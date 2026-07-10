'use client';

import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface AdminHeaderProps {
	onMenuToggle: () => void;
	isSidebarOpen: boolean;
}

export function AdminHeader({ onMenuToggle, isSidebarOpen }: AdminHeaderProps) {
	return (
		<header className="dashboard-navbar sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					className="lg:hidden"
					onClick={onMenuToggle}
					aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}>
					{isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
				</Button>
				<div className="hidden sm:block">
					<p className="text-sm font-semibold">Admin Portal</p>
					<p className="text-xs text-muted-foreground">Tiqwa Travel Management</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<div className="text-right">
					<p className="text-sm font-medium">Admin John</p>
					<p className="text-xs text-muted-foreground">Administrator</p>
				</div>
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
					AJ
				</div>
			</div>
		</header>
	);
}
