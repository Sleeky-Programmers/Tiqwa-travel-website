import { NextRequest, NextResponse } from 'next/server';

import { resolveCaughtError } from '@/lib/errorMessages';

const TIQWA_API_BASE_URL = 'https://sandbox.premiumwhitelabel.com/api/v2';

// Without this, an upstream that never responds leaves the caller's await hanging forever —
// there's no error, no results, just an infinite loader on the client.
const UPSTREAM_TIMEOUT_MS = 15000;

function isTimeoutError(error: unknown): boolean {
	return error instanceof Error && error.name === 'TimeoutError';
}

function proxyErrorResponse(error: unknown) {
	if (isTimeoutError(error)) {
		return NextResponse.json({ success: false, error: 'The upstream service took too long to respond. Please try again.' }, { status: 504 });
	}
	return NextResponse.json(
		{ success: false, error: resolveCaughtError(error, 'We ran into a problem reaching the service. Please try again in a moment.') },
		{ status: 500 }
	);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	try {
		const { path } = await params;
		const pathString = path.join('/');
		const searchParams = request.nextUrl.searchParams.toString();
		const url = `${TIQWA_API_BASE_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`;

		// Get the Authorization header from the client request
		const authHeader = request.headers.get('Authorization');
		const originHeader = request.headers.get('Origin') || process.env.NEXT_PUBLIC_APP_URL!;

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
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
			...(process.env.NODE_ENV === 'development' && {
				// @ts-ignore - Allow self-signed certs in development only
				agent: undefined,
			}),
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		});
	} catch (error) {
		return proxyErrorResponse(error);
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
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		});
	} catch (error) {
		return proxyErrorResponse(error);
	}
}

async function handleMutation(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
	method: 'PATCH' | 'DELETE'
) {
	try {
		const { path } = await params;
		const pathString = path.join('/');
		const url = `${TIQWA_API_BASE_URL}/${pathString}`;

		// PATCH/DELETE calls in this app don't always send a body — only
		// forward one if the client actually sent one.
		const rawBody = await request.text();

		// Get the Authorization header from the client request
		const authHeader = request.headers.get('Authorization');
		const baseURL = process.env.NEXT_PUBLIC_APP_URL!;
		const originHeader = request.headers.get('Origin') || baseURL;

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
			method,
			headers,
			...(rawBody ? { body: rawBody } : {}),
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		});
	} catch (error) {
		return proxyErrorResponse(error);
	}
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	return handleMutation(request, context, 'PATCH');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	return handleMutation(request, context, 'DELETE');
}

export async function OPTIONS() {
	return NextResponse.json(
		{},
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
			},
		}
	);
}
