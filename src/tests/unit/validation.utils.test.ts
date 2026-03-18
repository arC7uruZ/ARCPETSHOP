import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, petSchema, bookingSchema } from '$lib/utils/validation.utils';

describe('validation.utils', () => {
	describe('loginSchema', () => {
		it('validates a correct login', () => {
			const result = loginSchema.safeParse({ email: 'test@example.com', password: 'abc123' });
			expect(result.success).toBe(true);
		});

		it('rejects invalid email', () => {
			const result = loginSchema.safeParse({ email: 'not-an-email', password: 'abc123' });
			expect(result.success).toBe(false);
		});

		it('rejects short password', () => {
			const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' });
			expect(result.success).toBe(false);
		});
	});

	describe('registerSchema', () => {
		const valid = {
			full_name: 'João da Silva',
			email: 'joao@example.com',
			phone: '11999999999',
			password: 'senha123',
			confirmPassword: 'senha123'
		};

		it('validates correct registration', () => {
			expect(registerSchema.safeParse(valid).success).toBe(true);
		});

		it('rejects mismatched passwords', () => {
			const result = registerSchema.safeParse({
				...valid,
				confirmPassword: 'outrasenha'
			});
			expect(result.success).toBe(false);
			const errors = result.error?.flatten().fieldErrors;
			expect(errors?.confirmPassword).toBeDefined();
		});

		it('rejects short name', () => {
			const result = registerSchema.safeParse({ ...valid, full_name: 'AB' });
			expect(result.success).toBe(false);
		});
	});

	describe('petSchema', () => {
		const valid = {
			name: 'Bob',
			species: 'dog' as const
		};

		it('validates a minimal pet', () => {
			expect(petSchema.safeParse(valid).success).toBe(true);
		});

		it('validates a full pet', () => {
			const result = petSchema.safeParse({
				...valid,
				breed: 'Golden Retriever',
				size: 'large',
				birth_date: '2020-01-01',
				weight_kg: 25,
				color: 'Dourado'
			});
			expect(result.success).toBe(true);
		});

		it('rejects empty name', () => {
			const result = petSchema.safeParse({ ...valid, name: '' });
			expect(result.success).toBe(false);
		});

		it('rejects invalid species', () => {
			const result = petSchema.safeParse({ ...valid, species: 'dragon' });
			expect(result.success).toBe(false);
		});
	});

	describe('bookingSchema', () => {
		const valid = {
			serviceId: crypto.randomUUID(),
			petId: crypto.randomUUID(),
			date: '2025-03-15',
			time: '14:30'
		};

		it('validates a correct booking', () => {
			expect(bookingSchema.safeParse(valid).success).toBe(true);
		});

		it('rejects invalid date format', () => {
			const result = bookingSchema.safeParse({ ...valid, date: '15/03/2025' });
			expect(result.success).toBe(false);
		});

		it('rejects invalid time format', () => {
			const result = bookingSchema.safeParse({ ...valid, time: '2pm' });
			expect(result.success).toBe(false);
		});

		it('rejects non-UUID serviceId', () => {
			const result = bookingSchema.safeParse({ ...valid, serviceId: 'not-a-uuid' });
			expect(result.success).toBe(false);
		});
	});
});
