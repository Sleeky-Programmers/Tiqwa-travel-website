export const imageFixes = {
	createAccount: '/images/create-account.webp',
	dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
	paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
	login: '/images/login.webp',
	landingCta: '/images/landing-cta.webp',
	sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop',
	bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
	capeTown: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop',
	singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
};

const destinationImages: Record<string, string> = {
	'paris': imageFixes.paris,
	'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
	'dubai': imageFixes.dubai,
	'bali': imageFixes.bali,
	'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
	'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
	'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
	'singapore': imageFixes.singapore,
	'sydney': imageFixes.sydney,
	'cape town': imageFixes.capeTown,
	'miami': 'https://images.unsplash.com/photo-1514214104703-d6b9afbcb90e?w=800&h=600&fit=crop',
	'chicago': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop',
	'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
};

const defaultImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop';

export const getDestinationImage = (city: string): string => {
	return destinationImages[city.toLowerCase()] ?? defaultImage;
};

export const heroBackgroundImage = '/images/hero-image.webp';

export const emailVerificationImage = '/images/verify-security.webp';

export const searchHeroBackgroundImage = 'https://images.unsplash.com/photo-1767868277770-d8cb69800992?w=1920&h=1080&fit=crop&q=80';
