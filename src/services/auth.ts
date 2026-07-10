const TOKEN_KEY = 'tiqwa_access_token';
const USER_KEY = 'tiqwa_user';
const USER_ROLE_KEY = 'tiqwa_user_role';
// Refresh-ready: add REFRESH_TOKEN_KEY when API supports it

const AUTH_API_BASE = process.env.TIQWA_API_URL ?? 'https://sandbox.premiumwhitelabel.com/api/v2';

export interface AuthUser {
	id: number;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	avatar?: string;
	role?: string | null; // ✅ Added role field
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface SignupData {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone?: string;
}

interface AuthApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
}

interface LoginResponseData {
	token: string;
	role?: string | null; // ✅ Added role field
}

interface ProfileResponseData {
	id: number;
	name?: string;
	first_name?: string;
	last_name?: string;
	email: string;
	phone?: string;
	avatar?: string;
	role?: string | null; // ✅ Added role field
}

/**
 * Check if a user has admin privileges based on role
 * - If role is null → admin
 * - If role is "user" or "customer" → regular user
 * - Case-insensitive comparison
 */
export function isAdminUser(role?: string | null): boolean {
	if (role === null || role === undefined) return true;
	const normalizedRole = role.toLowerCase();
	return normalizedRole !== 'user' && normalizedRole !== 'customer';
}

function mapProfile(data: ProfileResponseData): AuthUser {
	const firstName = data.first_name ?? '';
	const lastName = data.last_name ?? '';
	return {
		id: data.id,
		name: data.name ?? `${firstName} ${lastName}`.trim(),
		firstName,
		lastName,
		email: data.email,
		phone: data.phone,
		avatar: data.avatar,
		role: data.role ?? null,
	};
}

export function setAccessToken(token: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function removeAccessToken(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
	localStorage.removeItem(USER_ROLE_KEY);
}

export function setAuthUser(user: AuthUser): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(USER_KEY, JSON.stringify(user));
	if (user.role !== undefined) {
		localStorage.setItem(USER_ROLE_KEY, user.role ?? 'null');
	}
}

export function getAuthUser(): AuthUser | null {
	if (typeof window === 'undefined') return null;
	const user = localStorage.getItem(USER_KEY);
	if (!user) return null;
	try {
		return JSON.parse(user) as AuthUser;
	} catch {
		return null;
	}
}

export function getUserRole(): string | null {
	if (typeof window === 'undefined') return null;
	const role = localStorage.getItem(USER_ROLE_KEY);
	if (role === 'null') return null;
	return role;
}

/**
 * Get the appropriate redirect path based on user role
 * - role: null → "/admin"
 * - role: "user" or "customer" → "/dashboard"
 * - Case-insensitive comparison
 */
export function getRedirectPath(role?: string | null): string {
	if (isAdminUser(role)) {
		return '/admin';
	}
	return '/dashboard';
}

export async function login(credentials: LoginCredentials): Promise<{
	success: boolean;
	token?: string;
	user?: AuthUser;
	redirectPath?: string;
	error?: string;
}> {
	try {
		const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(credentials),
		});
		const data = (await response.json()) as AuthApiResponse<LoginResponseData>;

		if (data.success && data.data?.token) {
			setAccessToken(data.data.token);

			// Fetch user profile to get role
			const user = await fetchUserProfile(data.data.token);

			if (user) {
				setAuthUser(user);
				const redirectPath = getRedirectPath(user.role);
				return {
					success: true,
					token: data.data.token,
					user,
					redirectPath,
				};
			}

			// Fallback: if user fetch fails but login succeeded
			return {
				success: true,
				token: data.data.token,
				redirectPath: '/dashboard',
			};
		}

		return { success: false, error: data.message ?? 'Login failed' };
	} catch {
		return { success: false, error: 'Network error. Please try again.' };
	}
}

export async function signup(data: SignupData): Promise<{ success: boolean; error?: string }> {
	try {
		const payload = { ...data };
		if (!payload.phone) delete payload.phone;

		const response = await fetch(`${AUTH_API_BASE}/auth/signup`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		const result = await response.json();
		if (result.success) return { success: true };
		return { success: false, error: result.message ?? 'Signup failed' };
	} catch (error) {
		console.error(error);
		return { success: false, error: (error as Error).message ?? 'Network error. Please try again.' };
	}
}

export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(`${AUTH_API_BASE}/auth/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		const result = await response.json();
		if (result.success) return { success: true };
		return {
			success: false,
			error: result.message ?? 'Password reset request failed',
		};
	} catch {
		return { success: false, error: 'Network error. Please try again.' };
	}
}

export async function resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> {
	if (newPassword !== confirmPassword) {
		return { success: false, error: 'Passwords do not match' };
	}

	try {
		const response = await fetch(`${AUTH_API_BASE}/auth/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, newPassword, confirmPassword }),
		});
		const result = await response.json();
		if (result.success) return { success: true };
		return { success: false, error: result.message ?? 'Password reset failed' };
	} catch {
		return { success: false, error: 'Network error. Please try again.' };
	}
}

export async function fetchUserProfile(token?: string): Promise<AuthUser | null> {
	const authToken = token ?? getAccessToken();
	if (!authToken) return null;

	try {
		const response = await fetch(`${AUTH_API_BASE}/user/profile`, {
			headers: { Authorization: `Bearer ${authToken}` },
		});
		const result = (await response.json()) as AuthApiResponse<ProfileResponseData>;

		if (result.success && result.data) {
			const user = mapProfile(result.data);
			setAuthUser(user);
			return user;
		}

		if (response.status === 401) {
			removeAccessToken();
		}

		return null;
	} catch {
		return null;
	}
}

export async function updateUserProfile(data: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
	const token = getAccessToken();
	if (!token) return { success: false, error: 'Not authenticated' };

	try {
		const response = await fetch(`${AUTH_API_BASE}/user/profile/update`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify({
				first_name: data.firstName,
				last_name: data.lastName,
				phone: data.phone,
			}),
		});
		const result = await response.json();
		if (result.success) {
			const currentUser = getAuthUser();
			if (currentUser) {
				setAuthUser({
					...currentUser,
					...data,
					name: data.firstName || data.lastName ? `${data.firstName ?? currentUser.firstName} ${data.lastName ?? currentUser.lastName}`.trim() : currentUser.name,
				});
			}
			return { success: true };
		}
		return { success: false, error: result.message ?? 'Update failed' };
	} catch {
		return { success: false, error: 'Network error' };
	}
}

export function logout(): void {
	removeAccessToken();
	if (typeof window !== 'undefined') {
		window.location.href = '/login';
	}
}

// Refresh-ready placeholder for future token refresh support
// export function getRefreshToken(): string | null { ... }
// export async function refreshAccessToken(): Promise<boolean> { ... }
