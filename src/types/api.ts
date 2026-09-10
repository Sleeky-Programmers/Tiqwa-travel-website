export interface ApiSuccess<T> {
	success: true;
	data: T;
	message?: string;
}

export interface ApiFailure {
	success?: false;
	data?: null;
	message: string;
	errors?: Record<string, string[]>;
	status?: string;
	status_code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
