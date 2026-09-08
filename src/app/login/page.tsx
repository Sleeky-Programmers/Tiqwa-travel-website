'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from '@/components/ui/Link';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/services/auth';
import { imageFixes } from '@/utils/images';

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { refreshUser } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const result = await login({ email, password });

		if (result.success) {
			await refreshUser();

			const redirectPath = result.redirectPath ?? '/dashboard';
			router.push(redirectPath);
		} else {
			setError(result.error ?? 'Invalid email or password');
		}

		setIsLoading(false);
	};

	return (
		<AuthLayout
			image={imageFixes.login}
			headline="Discover your next adventure."
			subtext="Sign in to access exclusive flight deals, custom travel alerts, and member-only pricing tailored just for you."
			badges={['Best price guarantee', '500+ airlines worldwide']}>
			<div className="page-fade-in">
				<h1 className="text-3xl font-extrabold">Welcome Back</h1>
				<p className="mt-2 text-sm text-muted-foreground">Please enter your credentials to access your account.</p>

				{error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

				<form
					onSubmit={handleSubmit}
					className="mt-6 space-y-4">
					<Input
						label="Email Address"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						required
					/>
					<div className="relative">
						<Input
							label="Password"
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-[calc(50%+0.30rem)] text-muted-foreground hover:text-foreground"
							aria-label={showPassword ? 'Hide password' : 'Show password'}>
							{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					</div>
					<div className="text-right">
						<Link
							href="/forgot-password"
							className="text-sm">
							Forgot password?
						</Link>
					</div>
					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={isLoading}>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
				</p>
			</div>
		</AuthLayout>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			}>
			<LoginContent />
		</Suspense>
	);
}
