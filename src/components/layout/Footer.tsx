import Link from "next/link";
import { Plane, Mail, Globe } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Container } from "@/components/ui/Container";

const footerLinks = {
	Company: [
		{ href: "/about", label: "About Us" },
		{ href: "/contact", label: "Contact" },
		{ href: "/faq", label: "FAQ" },
	],
	Legal: [
		{ href: "/terms", label: "Terms of Service" },
		{ href: "/privacy", label: "Privacy Policy" },
	],
	Explore: [
		{ href: "/search", label: "Search Flights" },
		{
			href: "/results?from=New+York&to=London&departure=2026-07-01&passengers=1",
			label: "Popular Routes",
		},
	],
};

const socialLinks = [
	{ href: "https://twitter.com", label: "Twitter", Icon: FaXTwitter },
	{ href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
	{ href: "https://facebook.com", label: "Facebook", Icon: FaFacebook },
	{ href: "mailto:hello@tiqwa.com", label: "Email", Icon: Mail },
	{ href: "https://tiqwa.com", label: "Website", Icon: Globe },
];

export function Footer() {
	return (
		<footer className="mt-auto bg-white dark:bg-background border-t border-border">
			{/* Gradient accent line at top */}
			<hr className="footer-accent-line" />

			<Container className="py-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand Column */}
					<div className="lg:col-span-2 flex flex-col gap-5">
						<Link
							href="/"
							className="flex items-center gap-2.5 group w-fit"
						>
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
								<Plane className="h-4 w-4" />
							</div>
							<span className="text-lg font-bold text-foreground">
								Tiqwa Travel
							</span>
						</Link>

						<p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
							Your gateway to the world. Find and book flights to over 500
							destinations with the best prices guaranteed.
						</p>

						{/* Social Icons */}
						<div className="flex items-center gap-2 mt-1">
							{socialLinks.map(({ href, label, Icon }) => (
								<a
									key={label}
									href={href}
									aria-label={label}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/8 hover:text-primary hover:scale-110"
								>
									<Icon className="h-3.5 w-3.5" />
								</a>
							))}
						</div>
					</div>

					{/* Link Columns */}
					{Object.entries(footerLinks).map(([title, links]) => (
						<div key={title} className="flex flex-col gap-4">
							<h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
								{title}
							</h4>
							<ul className="space-y-2.5">
								{links.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-all duration-200 hover:text-primary"
										>
											<span className="transition-transform duration-200 group-hover:translate-x-0.5">
												{link.label}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Container>

			{/* Bottom bar */}
			<div className="border-t border-border/60 bg-primary/3 dark:bg-primary/5">
				<Container className="py-4">
					<div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
						<p className="text-xs text-muted-foreground">
							&copy; {new Date().getFullYear()} Tiqwa Travel. All rights
							reserved.
						</p>
						<p className="text-xs text-muted-foreground">
							Made with ♥ for travelers everywhere
						</p>
					</div>
				</Container>
			</div>
		</footer>
	);
}
