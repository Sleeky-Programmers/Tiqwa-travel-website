import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

interface PublicLayoutProps {
	children: React.ReactNode;
	footerVariant?: 'default' | 'results';
}

export function PublicLayout({ children, footerVariant = 'default' }: PublicLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Navbar />
			<main
				className="flex-1"
				role="main">
				{children}
			</main>
			<Footer variant={footerVariant} />
		</div>
	);
}
