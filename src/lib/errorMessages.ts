// Backend/network failures often surface as a bare status code, a terse technical phrase, or an
// empty string. None of those tell the user what happened or what to do next, so we only trust a
// raw message when it actually looks like one — otherwise we fall back to the caller's
// context-specific, actionable copy.
const GENERIC_ERROR_PATTERNS = [
	/^\d{3}$/, // bare HTTP status code, e.g. "400", "500"
	/^(bad request|internal server error|server error|unknown error|an error occurred|something went wrong|request failed|api request failed|failed to fetch|load failed|network ?error|fetch failed|service unavailable|unauthorized|forbidden|not found)$/i,
];

function isGenericErrorMessage(message: string): boolean {
	const trimmed = message.trim();
	if (!trimmed) return true;
	return GENERIC_ERROR_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Prefer a specific backend message when it's actually informative (e.g. "Invalid or used Promo
 * Code"). Fall back to friendly, actionable copy for anything generic or technical — bare status
 * codes, "Server Error", empty strings — so a raw code is never the primary thing a user sees.
 */
export function resolveErrorMessage(raw: unknown, fallback: string): string {
	if (typeof raw === 'string' && !isGenericErrorMessage(raw)) {
		return raw;
	}
	return fallback;
}

/** Same idea, for values caught out of a try/catch (thrown Errors, aborted fetches, etc). */
export function resolveCaughtError(err: unknown, fallback: string): string {
	if (err instanceof Error) {
		if (err.name === 'TimeoutError' || err.name === 'AbortError') {
			return 'This is taking longer than expected. Please check your connection and try again.';
		}
		return resolveErrorMessage(err.message, fallback);
	}
	return fallback;
}
