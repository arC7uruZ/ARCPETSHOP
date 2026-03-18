import { describe, it, expect } from 'vitest';
import {
	formatDate,
	formatDateShort,
	formatTime,
	formatDateTime,
	formatDuration,
	getAvailableTimeSlots,
	isPastDate,
	combineDateAndTime
} from '$lib/utils/date.utils';

describe('date.utils', () => {
	describe('formatDate', () => {
		it('formats a date string to long Brazilian format', () => {
			const result = formatDate('2025-03-15');
			expect(result).toMatch(/15/);
			expect(result).toMatch(/março/i);
			expect(result).toMatch(/2025/);
		});

		it('accepts a Date object', () => {
			const date = new Date('2025-06-01');
			const result = formatDate(date);
			expect(result).toMatch(/junho/i);
		});
	});

	describe('formatDateShort', () => {
		it('formats as dd/mm/yyyy', () => {
			// Use UTC date to avoid timezone issues
			const result = formatDateShort(new Date('2025-03-15T12:00:00Z'));
			expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
		});
	});

	describe('formatTime', () => {
		it('formats time as HH:MM', () => {
			const result = formatTime('2025-03-15T14:30:00');
			expect(result).toMatch(/\d{2}:\d{2}/);
		});
	});

	describe('formatDuration', () => {
		it('returns minutes when less than 60', () => {
			expect(formatDuration(30)).toBe('30min');
			expect(formatDuration(45)).toBe('45min');
		});

		it('returns hours when divisible', () => {
			expect(formatDuration(60)).toBe('1h');
			expect(formatDuration(120)).toBe('2h');
		});

		it('returns hours and minutes when mixed', () => {
			expect(formatDuration(90)).toBe('1h 30min');
			expect(formatDuration(150)).toBe('2h 30min');
		});
	});

	describe('getAvailableTimeSlots', () => {
		it('returns slots for a future date', () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);
			const slots = getAvailableTimeSlots(futureDate);
			expect(slots.length).toBeGreaterThan(0);
			expect(slots[0]).toMatch(/^\d{2}:\d{2}$/);
		});

		it('slots are within business hours (08:00–18:00)', () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);
			const slots = getAvailableTimeSlots(futureDate);
			slots.forEach((slot) => {
				const [h] = slot.split(':').map(Number);
				expect(h).toBeGreaterThanOrEqual(8);
				expect(h).toBeLessThan(18);
			});
		});
	});

	describe('isPastDate', () => {
		it('returns true for a past date', () => {
			expect(isPastDate(new Date('2020-01-01'))).toBe(true);
		});

		it('returns false for a future date', () => {
			const future = new Date();
			future.setFullYear(future.getFullYear() + 1);
			expect(isPastDate(future)).toBe(false);
		});
	});

	describe('combineDateAndTime', () => {
		it('combines date string and time string into ISO', () => {
			const result = combineDateAndTime('2025-03-15', '14:30');
			expect(result).toContain('2025-03-15');
			expect(result).toContain('14:30');
		});
	});
});
