import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().email('E-mail inválido'),
	password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export const registerSchema = z
	.object({
		full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
		email: z.string().email('E-mail inválido'),
		phone: z
			.string()
			.regex(/^\+?[\d\s\-()]{10,}$/, 'Telefone inválido')
			.optional()
			.or(z.literal('')),
		password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas não coincidem',
		path: ['confirmPassword']
	});

export const petSchema = z.object({
	name: z.string().min(1, 'Nome é obrigatório'),
	species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other'], {
		errorMap: () => ({ message: 'Espécie inválida' })
	}),
	breed: z.string().optional().or(z.literal('')),
	size: z.enum(['small', 'medium', 'large', 'extra_large']).optional().nullable(),
	birth_date: z.string().optional().or(z.literal('')),
	weight_kg: z.coerce.number().positive('Peso deve ser positivo').optional().nullable(),
	color: z.string().optional().or(z.literal('')),
	notes: z.string().optional().or(z.literal(''))
});

export const bookingSchema = z.object({
	serviceId: z.string().uuid('Serviço inválido'),
	petId: z.string().uuid('Pet inválido'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
	time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
	notes: z.string().max(500, 'Observações muito longas').optional().or(z.literal(''))
});

export const profileSchema = z.object({
	full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
	phone: z
		.string()
		.regex(/^\+?[\d\s\-()]{10,}$/, 'Telefone inválido')
		.optional()
		.or(z.literal('')),
	address_street: z.string().optional().or(z.literal('')),
	address_city: z.string().optional().or(z.literal('')),
	address_state: z.string().optional().or(z.literal('')),
	address_zip: z.string().optional().or(z.literal(''))
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PetInput = z.infer<typeof petSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
