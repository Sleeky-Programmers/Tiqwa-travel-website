import type { NextConfig } from 'next';

const tiqwaApiUrl = process.env.TIQWA_API_URL ?? 'https://sandbox.premiumwhitelabel.com/api/v2';

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_TIQWA_API_URL: tiqwaApiUrl,
	},
	allowedDevOrigins: ['172.20.10.3', '192.168.100.133'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'randomuser.me',
			},
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
			{
				protocol: 'https',
				hostname: 'image.tiqwa.com',
			},
		],
	},
};

export default nextConfig;
