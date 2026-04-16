export const DAY_NAMES = [
	'Domingo',
	'Segunda-feira',
	'Terça-feira',
	'Quarta-feira',
	'Quinta-feira',
	'Sexta-feira',
	'Sábado'
];

/**
 * Formats a date string or Date object as a Brazilian locale string.
 * e.g. "15 de março de 2025"
 */
export const formatDate = (date: string | Date): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Formats a date as a short Brazilian locale string.
 * e.g. "15/03/2025"
 */
export const formatDateShort = (date: string | Date): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('pt-BR');
};

/**
 * Formats a date/time string as Brazilian time.
 * e.g. "14:30"
 */
export const formatTime = (date: string | Date): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats a date/time string as full Brazilian date + time.
 * e.g. "15/03/2025 às 14:30"
 */
export const formatDateTime = (date: string | Date): string => {
	return `${formatDateShort(date)} às ${formatTime(date)}`;
};

/**
 * Returns duration formatted as hours and minutes.
 * e.g. 90 → "1h 30min" | 45 → "45min" | 1440 → "24h"
 */
export const formatDuration = (minutes: number): string => {
	if (minutes < 60) return `${minutes}min`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}min`;
};

/**
 * Generates available time slots for a given date.
 * Returns slots between 08:00–18:00 in 30-minute increments.
 */
export const getAvailableTimeSlots = (date: Date): string[] => {
	const slots: string[] = [];
	const start = 8 * 60; // 08:00 in minutes
	const end = 18 * 60; // 18:00 in minutes
	const interval = 30;

	const today = new Date();
	const isToday = date.toDateString() === today.toDateString();
	const nowMinutes = isToday ? today.getHours() * 60 + today.getMinutes() : 0;

	for (let m = start; m < end; m += interval) {
		if (isToday && m <= nowMinutes + 60) continue; // need at least 1h advance notice
		const h = Math.floor(m / 60);
		const min = m % 60;
		slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
	}

	return slots;
};

/**
 * Checks if a date is in the past.
 */
export const isPastDate = (date: Date | string): boolean => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d < new Date();
};

/**
 * Returns minimum bookable date (tomorrow).
 */
export const getMinBookingDate = (): string => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return tomorrow.toISOString().split('T')[0];
};

/**
 * Returns maximum bookable date (30 days from now).
 */
export const getMaxBookingDate = (): string => {
	const max = new Date();
	max.setDate(max.getDate() + 30);
	return max.toISOString().split('T')[0];
};

/**
 * Combines a date string (YYYY-MM-DD) and time string (HH:MM) into an ISO string.
 */
export const combineDateAndTime = (date: string, time: string): string => {
	return new Date(`${date}T${time}:00`).toISOString();
};
