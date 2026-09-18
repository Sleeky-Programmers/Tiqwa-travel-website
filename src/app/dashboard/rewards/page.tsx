'use client';

import { ArrowRight, Check, Copy, Gift, History, Share2, Sparkles, Star, TrendingUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RewardsData, getRewardsData } from '@/services/whitelabel-api';

function StatusBadge({ label, type }: { label: string; type: 'success' | 'warning' | 'destructive' | 'info' }) {
	switch (type) {
		case 'success':
			return <span className="dc-badge dc-badge-success">{label}</span>;
		case 'warning':
			return <span className="dc-badge dc-badge-warning">{label}</span>;
		case 'destructive':
			return <span className="dc-badge dc-badge-destructive">{label}</span>;
		default:
			return <span className="dc-badge dc-badge-info">{label}</span>;
	}
}

function formatTxnDate(dateStr?: string): string {
	if (!dateStr) return '—';
	const parsed = new Date(dateStr);
	if (Number.isNaN(parsed.getTime())) return dateStr;
	return parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RewardsPage() {
	const [rewards, setRewards] = useState<RewardsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		async function loadRewards() {
			const result = await getRewardsData();
			if (result.success && result.data) {
				setRewards(result.data);
			}
			setIsLoading(false);
		}
		loadRewards();
	}, []);

	const copyReferralCode = () => {
		if (rewards?.referral_code) {
			navigator.clipboard.writeText(rewards.referral_code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const shareReferral = async () => {
		if (rewards?.referral_code) {
			const text = `Use my referral code ${rewards.referral_code} to get rewards on your next flight! ✈️`;
			try {
				await navigator.share({ text });
			} catch {
				await navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		}
	};

	const totalPoints = rewards?.total_referral_reward ?? 0;
	const referralCode = rewards?.referral_code || '—';
	const transactions = rewards?.referral_payment_history ?? [];
	const GOLD_TIER = 2500;

	const statCards = [
		{
			title: 'Total Points',
			value: totalPoints.toLocaleString(),
			sub: `${totalPoints > 0 ? '+' : ''}${totalPoints} this month`,
			icon: Gift,
			chip: 'bg-primary-light text-primary dark:bg-primary/15',
		},
		{
			title: 'Referrals',
			value: String(rewards?.referral_history?.length ?? 0),
			sub: 'Friends joined',
			icon: User,
			chip: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15',
		},
		{
			title: 'Next Tier',
			value: 'Gold',
			sub: `${Math.max(GOLD_TIER - totalPoints, 0).toLocaleString()} points to go`,
			icon: Star,
			chip: 'bg-amber-50 text-amber-500 dark:bg-amber-500/15',
		},
	];

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Rewards & Loyalty</h1>
					<p className="mt-1 text-xs text-muted-foreground">Earn points, refer friends, and save on flights</p>
				</div>
				<button
					type="button"
					onClick={shareReferral}
					disabled={!rewards?.referral_code}
					className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50">
					<TrendingUp className="h-3.5 w-3.5" />
					Start Earning
				</button>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-3">
				{statCards.map((stat) => (
					<div
						key={stat.title}
						className="dc-card flex items-start justify-between gap-3 p-5 transition-shadow hover:shadow-md">
						<div>
							<p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{stat.title}</p>
							<p className="mt-1.5 text-2xl font-bold tracking-tight">{stat.value}</p>
							<p className="mt-1.5 text-[11px] text-muted-foreground">{stat.sub}</p>
						</div>
						<div className={`dc-icon-chip h-10 w-10 ${stat.chip}`}>
							<stat.icon className="h-4.5 w-4.5" />
						</div>
					</div>
				))}
			</div>

			{/* Refer & Earn banner */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Refer & Earn</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Share your unique referral code with friends</p>
				</div>
				<div className="dc-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="dc-icon-chip h-10 w-10 bg-primary-light text-primary dark:bg-primary/15">
							<Sparkles className="h-4.5 w-4.5" />
						</div>
						<div>
							<p className="text-sm font-semibold">Invite Friends, Get Rewards</p>
							<p className="mt-0.5 text-xs text-muted-foreground">Share your unique code. When they book, you both earn rewards!</p>
						</div>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<code className="rounded-lg border border-[var(--dc-border)] bg-secondary/60 px-4 py-2 text-center font-mono text-sm dark:bg-white/5">{referralCode}</code>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={copyReferralCode}
								disabled={!rewards?.referral_code}
								className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dc-border)] px-3.5 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50">
								{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
								{copied ? 'Copied!' : 'Copy Link'}
							</button>
							<button
								type="button"
								onClick={shareReferral}
								disabled={!rewards?.referral_code}
								className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50">
								<Share2 className="h-3.5 w-3.5" />
								Share Code
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Transaction History table */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Transaction History</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Your reward earnings and transactions</p>
				</div>
				<div className="dc-card overflow-hidden">
					{isLoading ? (
						<div className="flex justify-center py-14">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						</div>
					) : transactions.length === 0 ? (
						<div className="p-10 text-center">
							<div className="dc-icon-chip mx-auto mb-4 h-14 w-14 bg-primary-light dark:bg-primary/15">
								<History className="h-6 w-6 text-primary" />
							</div>
							<p className="font-semibold">No transactions yet</p>
							<p className="mt-1 text-sm text-muted-foreground">Start referring friends to earn rewards</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="dc-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Date</th>
									<th>Amount (₦)</th>
									<th>Payment Method</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map((txn, i) => (
									<tr key={i}>
										<td className="font-mono text-xs font-medium">RW-{String(i + 1).padStart(4, '0')}</td>
										<td className="text-muted-foreground">{formatTxnDate(txn.date)}</td>
										<td className="font-semibold">{txn.amount?.toLocaleString?.() ?? txn.amount}</td>
										<td className="text-muted-foreground">
											<span className="inline-flex items-center gap-1.5">
												<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
												Referral Bonus
											</span>
										</td>
										<td>
											<StatusBadge
												label={txn.date ? 'Confirmed' : 'Pending'}
												type={txn.date ? 'success' : 'warning'}
											/>
										</td>
									</tr>
								))}
							</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Navy CTA band */}
			<div className="dc-cta relative overflow-hidden p-6 sm:p-7">
				<div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h3 className="text-lg font-bold">Earn More Rewards</h3>
						<p className="mt-1 text-sm text-[var(--ink-muted)]">Share your referral code with friends and family</p>
					</div>
					<Button
						variant="white"
						onClick={shareReferral}
						disabled={!rewards?.referral_code}
						className="shrink-0">
						<Share2 className="h-4 w-4" />
						Share Now
					</Button>
				</div>
			</div>
		</div>
	);
}
