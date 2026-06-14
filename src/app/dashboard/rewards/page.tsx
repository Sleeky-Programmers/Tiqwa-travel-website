"use client";

import { useEffect, useState } from "react";
import { Gift, History, TrendingUp, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getRewardsData, type RewardsData } from "@/services/whitelabel-api";

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="dashboard-page space-y-6">
      <div className="dashboard-page-header">
        <h1 className="dashboard-title">Rewards & Loyalty</h1>
        <p className="dashboard-subtitle">
          Earn points, refer friends, and save on flights
        </p>
      </div>

      <Card
        hover={false}
        className="bg-gradient-to-r from-primary/10 to-primary/5 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Your Points Balance</p>
            <p className="text-3xl font-bold">
              {rewards?.total_referral_reward ?? 0}
            </p>
          </div>
          <Gift className="h-12 w-12 text-primary/50" />
        </div>
      </Card>

      <Card hover={false} className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Refer & Earn</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Share your unique code with friends. When they book their first flight,
          you both earn rewards!
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono">
            {rewards?.referral_code || "—"}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={copyReferralCode}
            disabled={!rewards?.referral_code}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Card>

      <Card hover={false} className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        {!rewards?.referral_payment_history?.length ? (
          <p className="py-4 text-center text-muted-foreground">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {rewards.referral_payment_history.map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-2"
              >
                <span className="text-sm">{txn.date || "Referral reward"}</span>
                <span className="font-semibold text-green-600">
                  +{txn.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
