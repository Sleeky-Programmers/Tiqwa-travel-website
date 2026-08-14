import type { PassengerData } from '@/components/form/PassengerForm';

const PREFIX = 'tiqwa-checkout-draft:';

function storageKey(flightId: string): string {
	return `${PREFIX}${flightId}`;
}

// sessionStorage (not localStorage) deliberately — this holds passport numbers, DOB, etc.
// It should survive an accidental refresh within the tab, not linger on a shared machine.

export function readCheckoutDraft(flightId: string, expectedLength: number): PassengerData[] | null {
	if (typeof window === 'undefined' || !flightId) return null;
	try {
		const raw = sessionStorage.getItem(storageKey(flightId));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || parsed.length !== expectedLength) return null;
		return parsed as PassengerData[];
	} catch {
		return null;
	}
}

export function writeCheckoutDraft(flightId: string, passengers: PassengerData[]): void {
	if (typeof window === 'undefined' || !flightId) return;
	try {
		sessionStorage.setItem(storageKey(flightId), JSON.stringify(passengers));
	} catch {
		// Storage full or unavailable (e.g. private browsing) — not critical, skip silently.
	}
}

export function clearCheckoutDraft(flightId: string): void {
	if (typeof window === 'undefined' || !flightId) return;
	try {
		sessionStorage.removeItem(storageKey(flightId));
	} catch {
		// ignore
	}
}
