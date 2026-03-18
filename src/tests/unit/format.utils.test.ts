import { describe, it, expect } from 'vitest';
import {
	formatCurrency,
	formatPriceFrom,
	formatPhone,
	truncate,
	titleCase,
	formatSpecies,
	formatPetSize,
	formatAppointmentStatus,
	getStatusColor
} from '$lib/utils/format.utils';

describe('format.utils', () => {
	describe('formatCurrency', () => {
		it('formats as BRL', () => {
			const result = formatCurrency(45.5);
			expect(result).toContain('45');
			expect(result).toContain('R$');
		});

		it('includes cents', () => {
			expect(formatCurrency(45)).toContain('45');
		});
	});

	describe('formatPriceFrom', () => {
		it('prepends "A partir de"', () => {
			expect(formatPriceFrom(80)).toMatch(/A partir de/);
		});
	});

	describe('formatPhone', () => {
		it('formats 11-digit Brazilian mobile', () => {
			const result = formatPhone('11999999999');
			expect(result).toBe('(11) 99999-9999');
		});

		it('formats 10-digit Brazilian landline', () => {
			const result = formatPhone('1133334444');
			expect(result).toBe('(11) 3333-4444');
		});

		it('returns original for unrecognized format', () => {
			expect(formatPhone('123')).toBe('123');
		});
	});

	describe('truncate', () => {
		it('truncates strings longer than maxLength', () => {
			const result = truncate('Hello World', 5);
			expect(result).toBe('Hello...');
		});

		it('returns full string if within limit', () => {
			expect(truncate('Hi', 10)).toBe('Hi');
		});
	});

	describe('titleCase', () => {
		it('capitalizes each word', () => {
			expect(titleCase('hello world')).toBe('Hello World');
		});
	});

	describe('formatSpecies', () => {
		it('returns Portuguese label', () => {
			expect(formatSpecies('dog')).toBe('Cachorro');
			expect(formatSpecies('cat')).toBe('Gato');
			expect(formatSpecies('bird')).toBe('Pássaro');
		});

		it('returns the value for unknown species', () => {
			expect(formatSpecies('dinosaur')).toBe('dinosaur');
		});
	});

	describe('formatPetSize', () => {
		it('returns Portuguese label for known sizes', () => {
			expect(formatPetSize('small')).toContain('Pequeno');
			expect(formatPetSize('large')).toContain('Grande');
		});

		it('returns "Não informado" for null', () => {
			expect(formatPetSize(null)).toBe('Não informado');
		});
	});

	describe('formatAppointmentStatus', () => {
		it('returns Portuguese status', () => {
			expect(formatAppointmentStatus('pending')).toBe('Pendente');
			expect(formatAppointmentStatus('completed')).toBe('Concluído');
			expect(formatAppointmentStatus('cancelled')).toBe('Cancelado');
		});
	});

	describe('getStatusColor', () => {
		it('returns correct color for each status', () => {
			expect(getStatusColor('pending')).toBe('yellow');
			expect(getStatusColor('confirmed')).toBe('blue');
			expect(getStatusColor('completed')).toBe('green');
			expect(getStatusColor('cancelled')).toBe('red');
		});

		it('returns gray for unknown status', () => {
			expect(getStatusColor('unknown')).toBe('gray');
		});
	});
});
