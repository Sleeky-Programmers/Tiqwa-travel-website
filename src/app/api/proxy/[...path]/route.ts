import { NextRequest, NextResponse } from 'next/server';

const TIQWA_API_BASE_URL = 'https://sandbox.premiumwhitelabel.com/api/v2';

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		// In Next.js 15, params is a Promise
		const { path } = await params;
		const pathString = path.join('/');
		const url = `${TIQWA_API_BASE_URL}/${pathString}`;

		const body = await request.json();

		console.log('🔄 Proxy POST to:', url);
		console.log('📦 Request body:', JSON.stringify(body, null, 2));

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		const { path } = await params;
		const pathString = path.join('/');
		const searchParams = request.nextUrl.searchParams.toString();
		const url = `${TIQWA_API_BASE_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`;

		console.log('🔄 Proxy GET to:', url);

		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});
	} catch (error) {
		console.error('❌ Proxy error:', error);
		return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Proxy request failed' }, { status: 500 });
	}
}

export async function OPTIONS() {
	return NextResponse.json(
		{},
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		}
	);
}
