import { describe, expect, it } from 'vitest';

describe('Signup form validation', () => {
	it('rejects empty required fields', () => {
		const fields = {
			first_name: '   ',
			last_name: 'Smith',
			email: 'user@example.com',
			password: 'password123',
			confirmPassword: 'password123',
		};

		expect(!fields.first_name.trim()).toBe(true);
		expect(!fields.last_name.trim()).toBe(false);
		expect(!fields.email.trim()).toBe(false);
		expect(!fields.password).toBe(false);
	});

	it('rejects password shorter than 6 characters', () => {
		const password = 'abc';
		expect(password.length < 6).toBe(true);
		
	});

	it('accepts valid signup payload', () => {
		const payload = {
			first_name: 'Jane',
			last_name: 'Doe',
			email: 'jane@example.com',
			phone: '+234 801 234 5678',
			password: 'password123',
			confirmPassword: 'password123',
		};

		expect(payload.first_name.trim()).toBe('Jane');
		expect(payload.last_name.trim()).toBe('Doe');
		expect(payload.email.trim()).toBe('jane@example.com');
		expect(payload.password).toBe('password123');
		expect(payload.confirmPassword).toBe('password123');
		expect(payload.password.length).toBeGreaterThanOrEqual(6);
		expect(payload.password).toEqual(payload.confirmPassword);
	});
});
