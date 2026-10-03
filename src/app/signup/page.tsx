'use client';

import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from '@/components/ui/Link';
import { signup } from '@/services/auth';
import { imageFixes } from '@/utils/images';
import { formatPhoneNumber } from '@/utils/phone';

const SUCCESS_REDIRECT_MS = 1500;

export default function SignupPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validate all required signup fields are populated before triggering the API call.
		// This prevents the API from returning a generic "Some required fields are missing or empty!" error.
		if (!formData.first_name.trim()) {
			setError('First name is required.');
			return;
		}

		if (!formData.last_name.trim()) {
			setError('Last name is required.');
			return;
		}

		if (!formData.email.trim()) {
			setError('Email address is required.');
			return;
		}

		if (!formData.password) {
			setError('Password is required.');
			return;
		}

		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setIsLoading(true);
		const { confirmPassword: _, ...signupData } = formData;
		const payload = {
			...signupData,
			phone: signupData.phone.trim() || undefined,
		};
		const result = await signup(payload);

		if (result.success) {
			setIsSuccess(true);
			return;
		}

		setError(result.error ?? 'Signup failed. Please try again.');
		setIsLoading(false);
	};

	// Briefly confirm success, then hand off to the router. Prefetching /login up front
	// means the navigation itself is instant once this timer fires.
	useEffect(() => {
		router.prefetch('/login');
	}, [router]);

	useEffect(() => {
		if (!isSuccess) return;
		const timer = setTimeout(() => router.push('/login'), SUCCESS_REDIRECT_MS);
		return () => clearTimeout(timer);
	}, [isSuccess, router]);

	const authLayoutProps = {
		image: imageFixes.createAccount,
		headline: 'Unlock the best deals.',
		subtext: 'Join a community of smart travelers saving on global routes. Create your free account in less than a minute.',
		badges: ['Best Price Guarantee', '500+ Airlines'],
	};

	if (isSuccess) {
		return (
			<AuthLayout {...authLayoutProps}>
				<div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
					<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
						<CheckCircle2 className="h-8 w-8" />
					</div>
					<h1 className="text-3xl font-extrabold">Account Created!</h1>
					<p className="mt-3 text-muted-foreground">Taking you to sign in…</p>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			{...authLayoutProps}
			footer={
				<p className="text-center text-sm text-muted-foreground">
					Already have an account? <Link href="/login">Sign In</Link>
				</p>
			}>
			<div>
				<h1 className="text-3xl font-extrabold">Create Account</h1>
				<p className="mt-2 text-sm text-muted-foreground">Sign up today and start tracking your travel goals.</p>

				{error && <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

				<form
					onSubmit={handleSubmit}
					className="mt-6 space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<Input
							label="First Name"
							value={formData.first_name}
							onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
							placeholder="John"
							required
						/>
						<Input
							label="Last Name"
							value={formData.last_name}
							onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
							placeholder="Doe"
							required
						/>
					</div>
					<Input
						label="Email Address"
						type="email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						placeholder="you@example.com"
						required
					/>
					<Input
						label="Phone (Optional)"
						type="tel"
						value={formData.phone}
						onChange={(e) => handlePhoneChange(e)}
						placeholder="+234 801 234 5678"
					/>
					<div className="relative">
						<Input
							label="Password"
							type={showPassword ? 'text' : 'password'}
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							placeholder="Minimum 6 characters"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-[calc(50%+0.30rem)] text-muted-foreground transition-colors duration-200 hover:text-primary"
							aria-label={showPassword ? 'Hide password' : 'Show password'}>
							{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					</div>
					<Input
						label="Confirm Password"
						type={showPassword ? 'text' : 'password'}
						value={formData.confirmPassword}
						onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
						placeholder="Repeat your password"
						required
					/>
					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={isLoading}>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
					</Button>
				</form>
			</div>
		</AuthLayout>
	);
}
