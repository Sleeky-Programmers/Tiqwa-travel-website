'use client';

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!email || !password) {
			setError('Please enter your email and password');
			return;
		}

		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
			router.push('/admin');
		}, 600);
	};

	return (
		<div className="dashboard-shell relative flex min-h-screen items-center justify-center p-4">
			<div
				className="dashboard-bg-orbs"
				aria-hidden="true">
				<div className="dashboard-orb dashboard-orb-primary" />
				<div className="dashboard-orb dashboard-orb-accent" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="glossy-card relative w-full max-w-md p-8">
				<div className="text-center">
					<BrandLogo
						href="/admin"
						name="Tiqwa Admin"
						className="text-2xl text-foreground"
					/>
					<p className="mt-2 text-sm text-muted-foreground">Sign in to the admin dashboard</p>
				</div>

				{error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

				<form
					onSubmit={handleSubmit}
					className="mt-6 space-y-4">
					<Input
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="admin@tiqwa.com"
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
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}>
						{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
					</Button>
				</form>

				<p className="mt-6 text-center text-xs text-muted-foreground">Mock login — any credentials will redirect to the dashboard</p>
			</motion.div>
		</div>
	);
}
