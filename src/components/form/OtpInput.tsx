'use client';

import { motion } from 'motion/react';
import { useRef } from 'react';

interface OtpInputProps {
	length?: number;
	value: string[];
	onChange: (value: string[]) => void;
	disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, disabled }: OtpInputProps) {
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const updateOtp = (index: number, raw: string) => {
		const digits = raw.replace(/\D/g, '');
		if (!digits) {
			onChange(value.map((digit, digitIndex) => (digitIndex === index ? '' : digit)));
			return;
		}

		const next = [...value];
		digits
			.slice(0, length - index)
			.split('')
			.forEach((digit, offset) => {
				next[index + offset] = digit;
			});
		onChange(next);
		inputRefs.current[Math.min(index + digits.length, length - 1)]?.focus();
	};

	const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Backspace' && !value[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		updateOtp(0, event.clipboardData.getData('text'));
	};

	return (
		<div className="flex justify-between gap-2 sm:gap-3">
			{Array.from({ length }).map((_, index) => (
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
					className="h-12 w-12 shrink-0 rounded-sm border border-border/80 bg-background-card text-center text-xl font-bold text-foreground shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-all duration-200 outline-none placeholder:text-muted-foreground/50 hover:border-foreground/25 hover:shadow-[0_3px_12px_rgba(15,23,42,0.08)] focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_0_1px_var(--primary),0_4px_14px_rgba(255,90,54,0.12)] disabled:pointer-events-none disabled:opacity-50 sm:h-16 sm:w-16 sm:text-2xl"
					inputMode="numeric"
					maxLength={1}
					placeholder="-"
					value={value[index] ?? ''}
					disabled={disabled}
					onChange={(event) => updateOtp(index, event.target.value)}
					onKeyDown={(event) => handleKeyDown(index, event)}
					onPaste={handlePaste}
					required
				/>
			))}
		</div>
	);
}
