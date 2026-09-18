'use client';

import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronDown, CreditCard, LifeBuoy, Mail, MessageCircle, Plane, Search, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

const quickLinks = [
	{
		icon: Search,
		title: 'Search & Book Flights',
		description: 'Learn how to find the best deals and complete a booking.',
	},
	{
		icon: CreditCard,
		title: 'Payments & Refunds',
		description: 'Payment methods, billing and refund timelines.',
	},
	{
		icon: BookOpen,
		title: 'Managing Bookings',
		description: 'View, change or cancel an existing reservation.',
	},
	{
		icon: Shield,
		title: 'Account & Security',
		description: 'Passwords, verification and protecting your account.',
	},
];

const faqs = [
	{
		question: 'How do I search for flights?',
		answer:
			'Go to Search Flights in the sidebar, enter your departure city, destination, travel dates and passengers, then click Search Flights. You can switch between One Way, Round Trip and Multi-city searches.',
	},
	{
		question: 'Can I book flights for multiple passengers?',
		answer:
			'Yes. Use the passengers dropdown in the search form (up to 9 travellers). The total price on the booking page updates automatically to reflect every passenger.',
	},
	{
		question: 'How do I check my booking status?',
		answer:
			'Open My Bookings from the sidebar. Every reservation shows its status badge — Confirmed, Pending or Cancelled — along with the booking reference you can use at the airport.',
	},
	{
		question: 'What payment methods are accepted?',
		answer:
			'We support card payments and bank transfer at checkout. All payments are processed through secure, PCI-compliant payment gateways.',
	},
	{
		question: 'How do I earn and use rewards points?',
		answer:
			'You earn points on every completed booking and when friends book with your referral code from the Rewards page. Points can be applied to future bookings and redeemable rewards.',
	},
	{
		question: 'Can I cancel or change my booking?',
		answer:
			'Cancellation and change policies depend on the airline and fare type. Open the booking in My Bookings and use the Details link, or contact our support team for hands-on help.',
	},
	{
		question: 'How do I update my profile information?',
		answer:
			'Go to Profile Settings, click Edit Profile, make your changes and save. Your email address is verified and cannot be changed for security reasons.',
	},
];

const contactChannels = [
	{
		icon: MessageCircle,
		title: 'Live Chat',
		description: 'Chat with our 24/7 support team',
		action: 'Start Chat',
	},
	{
		icon: Mail,
		title: 'Email Support',
		description: 'support@tiqwatravel.com',
		action: 'Send Email',
		href: 'mailto:support@tiqwatravel.com',
	},
];

export default function HelpCenterPage() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Page header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Help Center</h1>
				<p className="mt-1 text-xs text-muted-foreground">Find answers to common questions or reach out to our support team</p>
			</div>

			{/* Hero band */}
			<div className="dc-cta relative overflow-hidden p-6 sm:p-7">
				<div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div className="flex items-start gap-3.5">
						<div className="dc-icon-chip h-11 w-11 bg-white/10">
							<LifeBuoy className="h-5 w-5 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-bold">How can we help?</h2>
							<p className="mt-1 text-sm text-[var(--ink-muted)]">Browse guides below or contact us — we&apos;re here 24/7</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick links */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Browse by Topic</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Jump straight to what you need</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					{quickLinks.map((link) => (
						<div
							key={link.title}
							className="dc-card flex items-center gap-3.5 p-4 transition-shadow hover:shadow-md">
							<div className="dc-icon-chip h-10 w-10 bg-primary-light text-primary dark:bg-primary/15">
								<link.icon className="h-4.5 w-4.5" />
							</div>
							<div className="min-w-0">
								<h3 className="text-sm font-semibold">{link.title}</h3>
								<p className="truncate text-xs text-muted-foreground">{link.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* FAQ accordion */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Frequently Asked Questions</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Quick answers to the questions we hear most</p>
				</div>
				<div className="dc-card overflow-hidden">
					{faqs.map((faq, i) => (
						<div
							key={i}
							className={cn('border-b border-[var(--dc-border-soft)] last:border-b-0')}>
							<button
								type="button"
								onClick={() => setOpenIndex(openIndex === i ? null : i)}
								className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-primary/3"
								aria-expanded={openIndex === i}>
								<span className="text-sm font-medium">{faq.question}</span>
								<ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', openIndex === i && 'rotate-180 text-primary')} />
							</button>
							<AnimatePresence initial={false}>
								{openIndex === i && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: 'auto', opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="overflow-hidden">
										<p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</div>
			</div>

			{/* Contact channels */}
			<div>
				<div className="mb-4">
					<h2 className="text-base font-bold">Still Need Help?</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">Our support team is available around the clock</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					{contactChannels.map((channel) => {
						const inner = (
							<>
								<div className="dc-icon-chip h-10 w-10 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15">
									<channel.icon className="h-4.5 w-4.5" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-sm font-semibold">{channel.title}</h3>
									<p className="truncate text-xs text-muted-foreground">{channel.description}</p>
								</div>
								<span className="inline-flex shrink-0 items-center rounded-full border border-[var(--dc-border)] px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
									{channel.action}
								</span>
							</>
						);
						const cls = 'dc-card group flex items-center gap-3.5 p-4 transition-shadow hover:shadow-md';
						return channel.href ? (
							<a
								key={channel.title}
								href={channel.href}
								className={cls}>
								{inner}
							</a>
						) : (
							<div
								key={channel.title}
								className={cls}>
								{inner}
							</div>
						);
					})}
				</div>
			</div>

			{/* Tip band */}
			<div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary-light px-4 py-3.5 dark:bg-primary/10">
				<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
				<p className="text-xs text-[var(--primary-dark)] dark:text-primary">
					Travel tip: keep your booking reference handy when contacting support — it helps us find your reservation instantly.
				</p>
			</div>
		</div>
	);
}
