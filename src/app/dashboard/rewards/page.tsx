'use client';

import { ArrowRight, Award, Check, Clock, Copy, Gift, History, Share2, Sparkles, Star, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { getRewardsData, RewardsData, type } from '@/services/whitelabel-api';

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
			const text = `Use my referral code ${rewards.referral_code} to get rewards on Tiqwa Travel! ✈️`;
			try {
				await navigator.share({ text });
			} catch {
				// Fallback - copy to clipboard
				await navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="relative">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
					<Gift className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
				</div>
				<p className="mt-4 text-sm text-muted-foreground">Loading your rewards...</p>
			</div>
		);
	}

	const totalPoints = rewards?.total_referral_reward ?? 0;
	const referralCode = rewards?.referral_code || '—';
	const transactions = rewards?.referral_payment_history ?? [];

	return (
		<div className="space-y-7 page-transition">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rewards & Loyalty</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<Award className="h-4 w-4" />
						Earn points, refer friends, and save on flights
					</p>
				</div>
				<div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
					<Sparkles className="h-3 w-3" />
					{totalPoints > 0 ? `${totalPoints} points earned` : 'Start earning'}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-3">
				{/* Total Points Card */}
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:from-amber-500/20 dark:via-primary/10 dark:shadow-none">
					<div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
					<div className="relative z-10">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Points</p>
								<p className="mt-1 text-3xl font-bold tracking-tight">{totalPoints}</p>
								<div className="mt-2 flex items-center gap-1.5">
									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
									<span className="text-xs font-medium text-emerald-500">+12% this month</span>
								</div>
							</div>
							<div className="rounded-2xl bg-amber-500/15 p-3">
								<Gift className="h-6 w-6 text-amber-500" />
							</div>
						</div>
					</div>
				</div>

				{/* Referrals Card */}
				<div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Referrals</p>
							<p className="mt-1 text-3xl font-bold tracking-tight">{transactions.length}</p>
							<div className="mt-2 flex items-center gap-1.5">
								<Users className="h-3.5 w-3.5 text-primary" />
								<span className="text-xs font-medium text-muted-foreground">Friends joined</span>
							</div>
						</div>
						<div className="rounded-2xl bg-primary/15 p-3">
							<Users className="h-6 w-6 text-primary" />
						</div>
					</div>
				</div>

				{/* Next Tier Card */}
				<div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none dark:hover:shadow-2xl">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Next Tier</p>
							<p className="mt-1 text-2xl font-bold tracking-tight">Gold</p>
							<div className="mt-2 flex items-center gap-1.5">
								<Star className="h-3.5 w-3.5 text-amber-500" />
								<span className="text-xs font-medium text-muted-foreground">2,550 points to go</span>
							</div>
						</div>
						<div className="rounded-2xl bg-amber-500/15 p-3">
							<Star className="h-6 w-6 text-amber-500" />
						</div>
					</div>
					<div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-amber-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
				</div>
			</div>

			{/* Referral Section */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">Refer & Earn</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Share your code and earn rewards</p>
					</div>
				</div>

				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:from-primary/20 dark:shadow-none">
					<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
					<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

					<div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-primary" />
								<p className="font-semibold">Invite Friends, Get Rewards</p>
							</div>
							<p className="text-sm text-muted-foreground mt-1">Share your unique code. When they book, you both earn rewards!</p>
						</div>

						<div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
							<div className="flex-1 sm:flex-none">
								<code className="block rounded-xl bg-white/60 px-4 py-2.5 text-sm font-mono text-center dark:bg-white/10">{referralCode}</code>
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={copyReferralCode}
									disabled={!rewards?.referral_code}
									className="rounded-xl hover:bg-primary/10 hover:text-primary">
									{copied ? (
										<>
											<Check className="h-4 w-4" />
											Copied!
										</>
									) : (
										<>
											<Copy className="h-4 w-4" />
											Copy
										</>
									)}
								</Button>
								<Button
									size="sm"
									onClick={shareReferral}
									disabled={!rewards?.referral_code}
									className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35">
									<Share2 className="h-4 w-4 mr-1.5" />
									Share
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Transaction History */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">Transaction History</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Your reward earnings</p>
					</div>
					{transactions.length > 0 && <span className="text-xs text-muted-foreground">{transactions.length} transactions</span>}
				</div>

				<div className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					{transactions.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/8">
								<History className="h-8 w-8 text-primary/40" />
							</div>
							<p className="font-medium">No transactions yet</p>
							<p className="mt-1 text-sm text-muted-foreground">Start referring friends to earn rewards</p>
						</div>
					) : (
						<div className="divide-y divide-border/60">
							{transactions.map((txn, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-4 transition-colors hover:bg-primary/5 first:rounded-t-2xl last:rounded-b-2xl">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
											<Gift className="h-4 w-4 text-emerald-500" />
										</div>
										<div>
											<p className="font-medium text-sm">{txn.date || 'Referral reward'}</p>
											<p className="text-xs text-muted-foreground flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{txn.date ? 'Completed' : 'Pending'}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-bold text-emerald-600 dark:text-emerald-400">+{txn.amount}</p>
										<p className="text-[10px] text-muted-foreground uppercase tracking-wide">Points</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* CTA Card */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent p-7 backdrop-blur-xl dark:from-amber-500/20 dark:via-primary/10">
				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

				<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15">
							<Sparkles className="h-6 w-6 text-amber-500" />
						</div>
						<div>
							<h3 className="text-lg font-bold">Earn More Rewards</h3>
							<p className="text-sm text-muted-foreground">Share your referral code with friends and family</p>
						</div>
					</div>
					<Button
						size="lg"
						onClick={shareReferral}
						disabled={!rewards?.referral_code}
						className="rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105">
						<Share2 className="mr-2 h-4 w-4" />
						Share Now
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
