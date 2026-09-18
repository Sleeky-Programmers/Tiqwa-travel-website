'use client';

import { Award, CheckCircle, Edit2, Eye, EyeOff, Loader2, Mail, MapPin, Plane, Shield, TriangleAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { updateUserProfile } from '@/services/auth';
import { getFlightBookings, getRewardsData } from '@/services/whitelabel-api';

function getInitials(name: string): string {
	return name
		.split(' ')
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export default function ProfilePage() {
	const { user, refreshUser } = useAuth();
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	// Change password state (backend endpoint pending — form is disabled until then)
	const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
	const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
	const [passwordMessage, setPasswordMessage] = useState<{ type: 'info' | 'error'; text: string } | null>(null);

	// Danger zone state
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Real stats (flights booked, rewards points, destinations visited)
	const [stats, setStats] = useState({ flights: 0, points: 0, destinations: 0 });

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || '',
				phone: user.phone || '',
			});
		}
	}, [user]);

	useEffect(() => {
		async function loadStats() {
			try {
				const [bookingsResult, rewardsResult] = await Promise.all([getFlightBookings(), getRewardsData()]);
				const bookings = bookingsResult.success ? bookingsResult.data : [];
				const destinations = new Set(bookings.map((b) => b.toCode || b.to).filter(Boolean));
				setStats({
					flights: bookings.length,
					points: rewardsResult.data?.total_referral_reward ?? 0,
					destinations: destinations.size,
				});
			} catch {
				// Keep zero defaults
			}
		}
		loadStats();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		const result = await updateUserProfile({
			firstName: formData.firstName,
			lastName: formData.lastName,
			phone: formData.phone,
		});

		if (result.success) {
			await refreshUser();
			setSuccess('Profile updated successfully');
			setIsEditing(false);
			setTimeout(() => setSuccess(null), 3000);
		} else {
			setError(result.error ?? 'Update failed');
		}

		setIsLoading(false);
	};

	const handleCancel = () => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || '',
				phone: user.phone || '',
			});
		}
		setIsEditing(false);
		setError(null);
	};

	const handlePasswordUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordMessage({
			type: 'info',
			text: 'Password changes are coming soon. Use "Forgot password" on the sign-in page to reset it securely by email.',
		});
	};

	const handleDeleteRequest = () => {
		setShowDeleteConfirm(true);
	};

	const displayName = `${formData.firstName} ${formData.lastName}`.trim() || 'User';
	const initials = getInitials(displayName);

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Profile Settings</h1>
					<p className="mt-1 text-xs text-muted-foreground">Manage your personal information</p>
				</div>
				<div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:flex dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
					<CheckCircle className="h-3.5 w-3.5" />
					Verified Account
				</div>
			</div>

			{/* Profile Header Card */}
			<div className="dc-card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
				<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-primary dark:bg-primary/15">
					<span className="select-none">{initials}</span>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2.5">
						<h2 className="text-lg font-bold">{displayName}</h2>
						<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
					</div>
					<p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
						<Mail className="h-3.5 w-3.5" />
						{formData.email}
					</p>
				</div>

				{/* Flights / Points stats */}
				<div className="flex shrink-0 gap-6 sm:ml-auto">
					<div className="text-center">
						<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Flights</p>
						<p className="mt-0.5 text-xl font-bold">{stats.flights}</p>
					</div>
					<div className="w-px bg-[var(--dc-border)]" />
					<div className="text-center">
						<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Points</p>
						<p className="mt-0.5 text-xl font-bold text-amber-500">{stats.points.toLocaleString()}</p>
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 sm:grid-cols-3">
			<div className="dc-card flex items-center justify-between gap-3 p-5">
				<div>
					<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Flights Booked</p>
					<p className="mt-1.5 text-2xl font-bold tracking-tight">{stats.flights}</p>
					<p className="mt-1.5 text-[11px] text-muted-foreground">Flights booked</p>
				</div>
				<div className="dc-icon-chip h-10 w-10 bg-primary-light text-primary dark:bg-primary/15">
					<Plane className="h-4.5 w-4.5" />
				</div>
			</div>

			<div className="dc-card flex items-center justify-between gap-3 p-5">
				<div>
					<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rewards Points</p>
					<p className="mt-1.5 text-2xl font-bold tracking-tight text-amber-500">{stats.points.toLocaleString()}</p>
					<p className="mt-1.5 text-[11px] text-muted-foreground">Points earned</p>
				</div>
				<div className="dc-icon-chip h-10 w-10 bg-amber-50 text-amber-500 dark:bg-amber-500/15">
					<Award className="h-4.5 w-4.5" />
				</div>
			</div>

			<div className="dc-card flex items-center justify-between gap-3 p-5">
				<div>
					<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Destinations</p>
					<p className="mt-1.5 text-2xl font-bold tracking-tight">{stats.destinations}</p>
					<p className="mt-1.5 text-[11px] text-muted-foreground">Cities visited</p>
				</div>
				<div className="dc-icon-chip h-10 w-10 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15">
					<MapPin className="h-4.5 w-4.5" />
				</div>
			</div>
			</div>

			{/* Personal Information */}
			<div className="dc-card overflow-hidden">
				<div className="flex items-center justify-between border-b border-[var(--dc-border)] px-6 py-4">
					<div>
						<h3 className="font-semibold">Personal Information</h3>
						<p className="text-xs text-muted-foreground">Update your personal information</p>
					</div>
					{!isEditing && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsEditing(true)}
							className="rounded-lg">
							<Edit2 className="h-3.5 w-3.5" />
							Edit Profile
						</Button>
					)}
				</div>

				<div className="p-6">
					{success && (
						<div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
							<CheckCircle className="h-5 w-5" />
							{success}
						</div>
					)}

					{error && (
						<div className="mb-4 flex items-center gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
							<X className="h-5 w-5" />
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<Input
								label="First Name"
								value={formData.firstName}
								onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
								disabled={!isEditing}
								required
								className={cn('transition-all', !isEditing && 'bg-muted/30 cursor-not-allowed')}
							/>
							<Input
								label="Last Name"
								value={formData.lastName}
								onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
								disabled={!isEditing}
								required
								className={cn('transition-all', !isEditing && 'bg-muted/30 cursor-not-allowed')}
							/>
						</div>

						<Input
							label="Email Address"
							type="email"
							value={formData.email}
							disabled
							className="bg-muted/30 cursor-not-allowed"
						/>

						<div>
							<Input
								label="Phone Number"
								type="tel"
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								disabled={!isEditing}
								placeholder="+234 801 234 5678"
								className={cn('transition-all', !isEditing && 'bg-muted/30 cursor-not-allowed')}
							/>
							{!isEditing && (
								<p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
									<Shield className="h-3 w-3 text-primary" />
									Your data is verified and cannot be changed
								</p>
							)}
						</div>

						{isEditing && (
							<div className="flex items-center gap-3 border-t border-[var(--dc-border)] pt-4">
								<Button
									type="submit"
									disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										'Save Changes'
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									className="hover:bg-destructive/10 hover:text-destructive">
									<X className="h-4 w-4" />
									Cancel
								</Button>
							</div>
						)}			</form>
			</div>
		</div>

			{/* Change Password + Danger Zone — side by side, equal height on desktop */}
			<div className="grid gap-6 lg:grid-cols-2">
			<div className="dc-card overflow-hidden">
				<div className="border-b border-[var(--dc-border)] px-6 py-4">
					<h3 className="font-semibold">Change Password</h3>
					<p className="text-xs text-muted-foreground">Update your account password</p>
				</div>
				<div className="p-6">
					{passwordMessage && (
						<div
							className={cn(
								'mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm',
								passwordMessage.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
							)}>
							<Shield className="h-5 w-5" />
							{passwordMessage.text}
						</div>
					)}
					<form
						onSubmit={handlePasswordUpdate}
						className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{(
							[
								{ key: 'current', label: 'Current Password', full: true },
								{ key: 'next', label: 'New Password', full: false },
								{ key: 'confirm', label: 'Confirm New Password', full: false },
							] as const
						).map((field) => (
							<div
								className={cn('relative', field.full && 'sm:col-span-2')}
								key={field.key}>
								<Input
									label={field.label}
									type={showPasswords[field.key] ? 'text' : 'password'}
									value={passwordForm[field.key]}
									onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !showPasswords[field.key] })}
									className="absolute right-3 top-[calc(50%+0.75rem)] text-muted-foreground transition-colors hover:text-primary"
									aria-label={showPasswords[field.key] ? 'Hide password' : 'Show password'}>
									{showPasswords[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						))}
						<div className="sm:col-span-2">
							<Button type="submit">Update Password</Button>
						</div>
					</form>
				</div>
			</div>

			{/* Danger Zone */}
			<div className="flex flex-col rounded-xl border border-destructive/25 bg-destructive/5 p-6">
				{/* Header */}
				<div className="flex items-start gap-3">
					<div className="dc-icon-chip h-10 w-10 bg-destructive/10 text-destructive">
						<TriangleAlert className="h-4.5 w-4.5" />
					</div>
					<div>
						<h3 className="font-semibold text-destructive">Danger Zone</h3>
						<p className="mt-0.5 text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
					</div>
				</div>

				{/* What gets removed */}
				<ul className="mt-5 space-y-2.5">
					{[
						'All flight bookings and trip history',
						'Rewards points and referral earnings',
						'Saved personal details and preferences',
					].map((item) => (
						<li
							key={item}
							className="flex items-center gap-2.5 text-xs text-muted-foreground">
							<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/50" />
							{item}
						</li>
					))}
				</ul>

				{/* Action — bottom-aligned so the card balances with the password card */}
				<div className="mt-auto flex flex-1 items-end pt-5">
					{showDeleteConfirm ? (
						<div className="w-full rounded-lg border border-destructive/20 bg-background-card p-4">
							<p className="text-xs font-medium text-foreground">This action cannot be undone.</p>
							<p className="mt-0.5 text-xs text-muted-foreground">Contact our support team to complete the process.</p>
							<div className="mt-3 flex gap-2">
								<Button
									href="/contact"
									size="sm">
									Contact Support
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowDeleteConfirm(false)}>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<button
							type="button"
							onClick={handleDeleteRequest}
							className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-background-card px-3.5 py-2 text-xs font-semibold text-destructive transition-colors hover:border-destructive hover:bg-destructive hover:text-white">
							<TriangleAlert className="h-3.5 w-3.5" />
							Delete Account
						</button>
					)}
				</div>
			</div>
			</div>
		</div>
	);
}
