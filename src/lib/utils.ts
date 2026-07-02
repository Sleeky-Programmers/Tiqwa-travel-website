import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Parse the instalments field from the payment method response
 * Returns the maximum number of instalments, then generate options from 2 to max
 */
export function parseInstalments(instalments: string | null): number[] {
	if (!instalments || instalments === 'null') return [];

	try {
		// Clean the string
		let cleaned = instalments.trim();

		// Handle cases like "\"[4]\"" -> remove outer quotes
		if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
			cleaned = cleaned.slice(1, -1);
		}

		// Parse the JSON array
		const parsed = JSON.parse(cleaned);

		if (Array.isArray(parsed) && parsed.length > 0) {
			// Get the maximum instalment number
			const maxInstalments = Math.max(...parsed.map(Number).filter((n) => !isNaN(n)));

			// Generate options from 2 to max (minimum 2 instalments)
			const options: number[] = [];
			for (let i = 2; i <= maxInstalments; i++) {
				options.push(i);
			}
			return options;
		}

		return [];
	} catch (error) {
		console.warn('Failed to parse instalments:', instalments, error);
		return [];
	}
}
