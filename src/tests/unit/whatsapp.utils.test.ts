import { describe, it, expect } from 'vitest';
import { buildWhatsAppUrl, getDefaultWhatsAppUrl, buildBookingWhatsAppMessage } from '$lib/utils/whatsapp.utils';

describe('whatsapp.utils', () => {
	describe('buildWhatsAppUrl', () => {
		it('builds a base wa.me URL', () => {
			const url = buildWhatsAppUrl('5511999999999');
			expect(url).toBe('https://wa.me/5511999999999');
		});

		it('encodes message as query param', () => {
			const url = buildWhatsAppUrl('5511999999999', 'Hello World');
			expect(url).toContain('text=Hello%20World');
		});
	});

	describe('getDefaultWhatsAppUrl', () => {
		it('returns a wa.me URL with the configured number', () => {
			const url = getDefaultWhatsAppUrl();
			expect(url).toContain('wa.me/5511999999999');
		});

		it('accepts a custom message', () => {
			const url = getDefaultWhatsAppUrl('Custom message');
			expect(url).toContain('Custom');
		});
	});

	describe('buildBookingWhatsAppMessage', () => {
		it('includes all booking details', () => {
			const msg = buildBookingWhatsAppMessage({
				userName: 'João',
				petName: 'Bob',
				serviceName: 'Banho e Tosa',
				scheduledAt: '2025-03-15T14:30:00'
			});

			expect(msg).toContain('João');
			expect(msg).toContain('Bob');
			expect(msg).toContain('Banho e Tosa');
			expect(msg).toContain('14:30');
		});
	});
});
