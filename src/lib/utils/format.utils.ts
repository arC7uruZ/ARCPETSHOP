/**
 * Formats a number as Brazilian currency (BRL).
 * e.g. 45.5 → "R$ 45,50"
 */
export const formatCurrency = (value: number): string =>
	new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * Formats a price as "A partir de R$ X,XX".
 */
export const formatPriceFrom = (price: number): string => `A partir de ${formatCurrency(price)}`;

/**
 * Formats a Brazilian phone number.
 * e.g. "11999999999" → "(11) 99999-9999"
 */
export const formatPhone = (phone: string): string => {
	const digits = phone.replace(/\D/g, '');
	if (digits.length === 11) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}
	if (digits.length === 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return phone;
};

/**
 * Truncates a string to a maximum length, appending ellipsis.
 */
export const truncate = (str: string, maxLength: number): string =>
	str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

/**
 * Capitalizes the first letter of each word.
 */
export const titleCase = (str: string): string =>
	str
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

/**
 * Returns a human-readable label for pet species.
 */
export const formatSpecies = (species: string): string => {
	const labels: Record<string, string> = {
		dog: 'Cachorro',
		cat: 'Gato',
		bird: 'Pássaro',
		rabbit: 'Coelho',
		other: 'Outro'
	};
	return labels[species] ?? species;
};

/**
 * Returns a human-readable label for pet size.
 */
export const formatPetSize = (size: string | null): string => {
	if (!size) return 'Não informado';
	const labels: Record<string, string> = {
		small: 'Pequeno (até 10kg)',
		medium: 'Médio (10–25kg)',
		large: 'Grande (25–45kg)',
		extra_large: 'Extra grande (45kg+)'
	};
	return labels[size] ?? size;
};

/**
 * Returns a human-readable label for appointment status.
 */
export const formatAppointmentStatus = (status: string): string => {
	const labels: Record<string, string> = {
		pending: 'Pendente',
		confirmed: 'Confirmado',
		in_progress: 'Em andamento',
		completed: 'Concluído',
		cancelled: 'Cancelado',
		no_show: 'Não compareceu'
	};
	return labels[status] ?? status;
};

/**
 * Returns a Tailwind color class for appointment status.
 */
export const getStatusColor = (
	status: string
): 'gray' | 'yellow' | 'blue' | 'green' | 'red' | 'orange' => {
	const colors: Record<string, 'gray' | 'yellow' | 'blue' | 'green' | 'red' | 'orange'> = {
		pending: 'yellow',
		confirmed: 'blue',
		in_progress: 'orange',
		completed: 'green',
		cancelled: 'red',
		no_show: 'gray'
	};
	return colors[status] ?? 'gray';
};
