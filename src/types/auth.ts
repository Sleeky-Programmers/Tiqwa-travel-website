import type { ApiResponse } from './api';

export interface AuthUser {
	id: number;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	avatar?: string;
	role?: string | null;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface SignupData {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone?: string;
}

export interface AuthApiUser {
	uniqueid: number | string;
	name: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	language: string | null;
	avatar: string | null;
	token: string | null;
	last_login_at: string | null;
	last_login_ip: string | null;
	created_at: string;
	updated_at: string;
	role?: string | null;
}

export interface ProfileApiUser {
	id: number;
	name?: string;
	first_name?: string;
	last_name?: string;
	email: string;
	phone?: string | null;
	avatar?: string | null;
	role?: string | null;
}

export interface VerifyEmailData {
	uniqueid?: number | string;
	email?: string;
	email_verified_at?: string | null;
	[key: string]: unknown;
}

export type AuthApiResponse<T> = ApiResponse<T>;
