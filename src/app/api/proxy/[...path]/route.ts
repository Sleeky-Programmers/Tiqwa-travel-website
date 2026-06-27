import { NextRequest, NextResponse } from 'next/server';

const TIQWA_API_BASE_URL = 'https://sandbox.premiumwhitelabel.com/api/v2';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		const { path } = await params;
		const pathString = path.join('/');
		const searchParams = request.nextUrl.searchParams.toString();
		const url = `${TIQWA_API_BASE_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`;

		// Get the Authorization header from the client request
		const authHeader = request.headers.get('Authorization');
		const originHeader = request.headers.get('Origin') || process.env.NEXT_PUBLIC_APP_URL!;

		console.log('🔄 Proxy GET to:', url);
		console.log('🔑 Auth header present:', !!authHeader);

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Origin': originHeader,
			'User-Agent': 'Mozilla/5.0 (compatible; TiqwaProxy/1.0)',
		};

		// Forward the Authorization header if present
		if (authHeader) {
			headers['Authorization'] = authHeader;
		}

		const response = await fetch(url, {
			method: 'GET',
			headers,
			...(process.env.NODE_ENV === 'development' && {
				// @ts-ignore - Allow self-signed certs in development only
				agent: undefined,
			}),
		});

		console.log('✅ Proxy response status:', response.status);

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		});
	} catch (error) {
		console.error('❌ Proxy error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Proxy request failed',
				...(error instanceof Error && { stack: error.stack }),
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		const { path } = await params;
		const pathString = path.join('/');
		const url = `${TIQWA_API_BASE_URL}/${pathString}`;

		const body = await request.json();

		// Get the Authorization header from the client request
		const authHeader = request.headers.get('Authorization');
		const baseURL = process.env.NEXT_PUBLIC_APP_URL!;
		const originHeader = request.headers.get('Origin') || baseURL;

		console.log('🔄 Proxy POST to:', url);
		console.log('🔑 Auth header present:', !!authHeader);
		console.log('📦 Request body:', JSON.stringify(body, null, 2));

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Origin': originHeader,
			'User-Agent': 'Mozilla/5.0 (compatible; TiqwaProxy/1.0)',
		};

		// Forward the Authorization header if present
		if (authHeader) {
			headers['Authorization'] = authHeader;
		}

		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		});

		console.log('✅ Proxy response status:', response.status);

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		});
	} catch (error) {
		console.error('❌ Proxy error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Proxy request failed',
			},
			{ status: 500 }
		);
	}
}

export async function OPTIONS() {
	return NextResponse.json(
		{},
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		}
	);
}
