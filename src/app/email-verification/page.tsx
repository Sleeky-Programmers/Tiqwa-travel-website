'use client';

import Image from 'next/image';
import { useState } from 'react';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from '@/components/ui/Link';

const verifySecurityImage = '/images/verify-security.webp';

export default function EmailVerificationPage() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [isSending, setIsSending] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSending(true);
		await new Promise((resolve) => setTimeout(resolve, 600));
		setSent(true);
		setIsSending(false);
	};

	return (
		<PublicLayout>
			<div className="page-fade-in grid min-h-[80vh] lg:grid-cols-2">
				<div className="relative hidden min-h-[32rem] overflow-hidden lg:block">
					<Image
						src={verifySecurityImage}
						alt="Hot air balloons over a sunrise landscape"
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
					<div className="absolute bottom-10 left-10 max-w-sm text-white">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Account security</p>
						<h1 className="mt-3 text-4xl font-extrabold">One more step to start travelling.</h1>
					</div>
				</div>

				<div className="flex items-center justify-center px-6 py-16 sm:px-12">
					<div className="w-full max-w-md">
						<div className="mb-8">
							<p className="text-sm font-semibold uppercase tracking-wider text-primary">Email verification</p>
							<h2 className="mt-2 text-3xl font-extrabold">Verify your email</h2>
							<p className="mt-3 text-muted-foreground">Enter your email and we&apos;ll send a verification link to secure your account.</p>
						</div>

						{sent ? (
							<div className="rounded-md bg-primary/10 p-5 text-sm text-foreground">
								<p className="font-semibold">Verification link sent.</p>
								<p className="mt-1 text-muted-foreground">Check {email} and follow the link to continue.</p>
								<Button
									type="button"
									variant="outline"
									className="mt-5"
									onClick={() => setSent(false)}>
									Use another email
								</Button>
							</div>
						) : (
							<form
								onSubmit={handleSubmit}
								className="space-y-5">
								<Input
									label="Email address"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder="you@example.com"
									required
								/>
								<Button
									type="submit"
									className="w-full"
									disabled={isSending}>
									{isSending ? 'Sending link...' : 'Send verification link'}
								</Button>
							</form>
						)}

						<p className="mt-8 text-sm text-muted-foreground">
							Already verified? <Link href="/login">Back to login</Link>
						</p>
					</div>
				</div>
			</div>
		</PublicLayout>
	);
}
