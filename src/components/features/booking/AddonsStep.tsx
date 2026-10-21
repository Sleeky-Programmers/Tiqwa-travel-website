'use client';

import { Check, Loader2, Package } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { formatFlightPrice } from '@/services/whitelabel-api';

import type { FlightAddon } from '@/types/whitelabel';

interface AddonsStepProps {
	addons: FlightAddon[];
	selectedIds: number[];
	isLoading: boolean;
	error: string | null;
	onToggle: (id: number) => void;
	onContinue: () => void;
}

export function AddonsStep({ addons, selectedIds, isLoading, error, onToggle, onContinue }: AddonsStepProps) {
	return (
		<div>
			<h2 className="text-lg font-semibold">Flight Add-ons</h2>
			<p className="mt-1 text-sm text-muted-foreground">Optional extras for your trip. Select any you&apos;d like — they&apos;ll be added to your total.</p>

			<div className="mt-5 space-y-3">
				{isLoading ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading add-ons...
					</div>
				) : error ? (
					<p className="text-sm text-destructive">{error}</p>
				) : addons.length === 0 ? (
					<p className="text-sm text-muted-foreground">No add-ons are available right now.</p>
				) : (
					addons.map((addon) => {
						const selected = selectedIds.includes(addon.id);
						return (
							<button
								key={addon.id}
								type="button"
								role="checkbox"
								aria-checked={selected}
								onClick={() => onToggle(addon.id)}
								className={cn(
									'flex w-full items-center gap-4 rounded-md border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md',
									selected ? 'border-primary bg-primary/5' : 'border-border'
								)}>
								<div
									className={cn(
										'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
										selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
									)}>
									{selected && <Check className="h-3.5 w-3.5" />}
								</div>
								<Package className="h-5 w-5 shrink-0 text-primary" />
								<div className="min-w-0 flex-1">
									<p className="font-semibold">{addon.name}</p>
									{addon.description && <p className="text-sm text-muted-foreground">{addon.description}</p>}
								</div>
								<span className="shrink-0 font-semibold">{formatFlightPrice(addon.price, 'NGN')}</span>
							</button>
						);
					})
				)}
			</div>

			<Button
				className="mt-6 w-full sm:w-auto"
				onClick={onContinue}
				disabled={isLoading}>
				{selectedIds.length > 0 ? 'Continue to Payment' : 'Skip & Continue to Payment'}
			</Button>
		</div>
	);
}
