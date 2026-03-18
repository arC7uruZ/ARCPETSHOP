export type { Database } from './database.types';

// ─── Profile ────────────────────────────────────────────────────────────────
export interface Profile {
	id: string;
	full_name: string;
	phone: string | null;
	cpf: string | null;
	avatar_url: string | null;
	address_street: string | null;
	address_city: string | null;
	address_state: string | null;
	address_zip: string | null;
	whatsapp_opt_in: boolean;
	created_at: string;
	updated_at: string;
}

export interface ProfileUpdate {
	full_name?: string;
	phone?: string | null;
	cpf?: string | null;
	avatar_url?: string | null;
	address_street?: string | null;
	address_city?: string | null;
	address_state?: string | null;
	address_zip?: string | null;
	whatsapp_opt_in?: boolean;
}

// ─── Pet ─────────────────────────────────────────────────────────────────────
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type PetSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface Pet {
	id: string;
	owner_id: string;
	name: string;
	species: PetSpecies;
	breed: string | null;
	size: PetSize | null;
	birth_date: string | null;
	weight_kg: number | null;
	color: string | null;
	notes: string | null;
	avatar_url: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface PetInsert {
	owner_id: string;
	name: string;
	species: PetSpecies;
	breed?: string | null;
	size?: PetSize | null;
	birth_date?: string | null;
	weight_kg?: number | null;
	color?: string | null;
	notes?: string | null;
	avatar_url?: string | null;
}

export interface PetUpdate {
	name?: string;
	species?: PetSpecies;
	breed?: string | null;
	size?: PetSize | null;
	birth_date?: string | null;
	weight_kg?: number | null;
	color?: string | null;
	notes?: string | null;
	avatar_url?: string | null;
	is_active?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export interface Service {
	id: string;
	slug: string;
	name: string;
	description: string;
	short_desc: string;
	price_from: number;
	duration_min: number;
	image_url: string | null;
	is_active: boolean;
	display_order: number;
	created_at: string;
	updated_at: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────
export type AppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'in_progress'
	| 'completed'
	| 'cancelled'
	| 'no_show';

export interface Appointment {
	id: string;
	user_id: string;
	pet_id: string;
	service_id: string;
	status: AppointmentStatus;
	scheduled_at: string;
	duration_min: number;
	price_charged: number | null;
	notes: string | null;
	internal_notes: string | null;
	cancelled_at: string | null;
	cancellation_reason: string | null;
	whatsapp_notified: boolean;
	notification_sid: string | null;
	created_at: string;
	updated_at: string;
}

export interface AppointmentFull {
	id: string;
	status: AppointmentStatus;
	scheduled_at: string;
	duration_min: number;
	price_charged: number | null;
	notes: string | null;
	whatsapp_notified: boolean;
	created_at: string;
	updated_at: string;
	user_id: string;
	user_name: string;
	user_phone: string | null;
	pet_id: string;
	pet_name: string;
	pet_species: string;
	pet_breed: string | null;
	service_id: string;
	service_slug: string;
	service_name: string;
	service_image_url: string | null;
}

export interface AppointmentInsert {
	user_id: string;
	pet_id: string;
	service_id: string;
	scheduled_at: string;
	duration_min: number;
	price_charged?: number | null;
	notes?: string | null;
}

// ─── Booking Form ─────────────────────────────────────────────────────────────
export interface BookingFormData {
	serviceId: string;
	petId: string;
	scheduledAt: string;
	notes?: string;
}

// ─── UI ──────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

export interface NavItem {
	href: string;
	label: string;
	icon?: string;
}
