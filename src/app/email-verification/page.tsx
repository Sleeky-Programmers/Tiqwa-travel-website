'use client';

import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AuthVisualPanel } from '@/components/layout/AuthVisualPanel';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Link } from '@/components/ui/Link';
import { verifyEmail } from '@/services/auth';

const verifySecurityImage = '/images/verify-security.webp';

export default function EmailVerificationPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	useEffect(() => {
		setEmail(new URLSearchParams(window.location.search).get('email') ?? '');
	}, []);

	const updateOtp = (index: number, value: string) => {
		const digits = value.replace(/\D/g, '');
		if (!digits) {
			setOtp((current) => current.map((digit, digitIndex) => (digitIndex === index ? '' : digit)));
			return;
		}

		setOtp((current) => {
			const next = [...current];
			digits
				.slice(0, 6 - index)
				.split('')
				.forEach((digit, offset) => {
					next[index + offset] = digit;
				});
			return next;
		});
		inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
	};

	const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Backspace' && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		updateOtp(0, event.clipboardData.getData('text'));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		const code = otp.join('');
		if (!email.trim() || code.length !== 6) {
			setError('Enter the 6-digit verification code sent to your email.');
			return;
		}

		setIsVerifying(true);
		const result = await verifyEmail({ email: email.trim(), token: code });
		setIsVerifying(false);

		if (result.success) {
			router.push('/login');
			return;
		}

		setError(result.errors?.token?.[0] ?? result.error ?? 'Verification failed. Please try again.');
	};

	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			<AuthVisualPanel
				image={verifySecurityImage}
				eyebrow={<p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Account security</p>}
				headline="One more step to start travelling."
				badges={[
					<>
						<ShieldCheck
							className="h-4 w-4 text-primary"
							aria-hidden="true"
						/>
						Secure OTP Verification
					</>,
					<>
						<LockKeyhole
							className="h-4 w-4 text-primary"
							aria-hidden="true"
						/>
						256-bit Encrypted
					</>,
				]}
				logo={
					<Link
						href="/"
						className="absolute left-10 top-10 z-10 flex items-center gap-2">
						<BrandLogo className="text-2xl text-white" />
					</Link>
				}
			/>

			<div className="flex min-h-screen flex-col items-center justify-center px-6 py-8 sm:px-12">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
					className="flex w-full max-w-md flex-1 flex-col justify-center">
					<div className="mb-8">
						<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Mail
								className="h-7 w-7"
								aria-hidden="true"
							/>
						</div>
						<h2 className="text-3xl font-extrabold">Verify Your Email</h2>
						<p className="mt-3 text-muted-foreground">
							We&apos;ve sent a 6-digit verification code to <strong className="font-bold text-foreground">{email || 'your email address'}</strong>. Please enter it below
							to confirm your account.
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						className="space-y-5">
						<fieldset>
							<legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">Secure Verification Code</legend>
							<div className="flex justify-between gap-2 sm:gap-3">
								{otp.map((digit, index) => (
									<motion.input
										key={index}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.35, delay: 0.3 + index * 0.05 }}
										ref={(element) => {
											inputRefs.current[index] = element;
										}}
										id={`otp-${index}`}
										aria-label={`Verification digit ${index + 1}`}
										className="h-12 w-12 shrink-0 rounded-sm border border-border/80 bg-background-card text-center text-xl font-bold text-foreground shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-all duration-200 outline-none placeholder:text-muted-foreground/50 hover:border-foreground/25 hover:shadow-[0_3px_12px_rgba(15,23,42,0.08)] focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_0_1px_var(--primary),0_4px_14px_rgba(255,90,54,0.12)] sm:h-16 sm:w-16 sm:text-2xl"
										inputMode="numeric"
										maxLength={1}
										placeholder="-"
										value={digit}
										onChange={(event) => updateOtp(index, event.target.value)}
										onKeyDown={(event) => handleOtpKeyDown(index, event)}
										onPaste={handleOtpPaste}
										required
									/>
								))}
							</div>
						</fieldset>
						{error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
						<Button
							type="submit"
							className="h-[3.25rem] w-full"
							disabled={isVerifying}>
							{isVerifying ? 'Verifying...' : 'Verify Code'}
						</Button>
					</form>
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.6 }}
					className="w-full max-w-md shrink-0 pt-6 text-center text-sm text-muted-foreground">
					Already verified? <Link href="/login">Back to login</Link>
				</motion.p>
			</div>
		</div>
	);
}
