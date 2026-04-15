export type { Database } from './database.types';

// ─── Roles ───────────────────────────────────────────────────────────────────
export type UserRole = 'customer' | 'caretaker' | 'admin' | 'root_admin';

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
	role: UserRole;
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
	caretaker_id: string | null;
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
	internal_notes: string | null;
	whatsapp_notified: boolean;
	cancelled_at: string | null;
	cancellation_reason: string | null;
	caretaker_id: string | null;
	caretaker_name: string | null;
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
	caretaker_id?: string | null;
	scheduled_at: string;
	duration_min: number;
	price_charged?: number | null;
	notes?: string | null;
}

// ─── Booking Form ─────────────────────────────────────────────────────────────
export interface BookingFormData {
	serviceId: string;
	petId: string;
	caretakerId?: string | null;
	scheduledAt: string;
	notes?: string;
}

// ─── Caretaker (Cuidador) ─────────────────────────────────────────────────────
export interface Caretaker {
	id: string;
	user_id: string | null;
	name: string;
	bio: string | null;
	specialties: string[]; // array de service ids
	is_active: boolean;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface CaretakerInsert {
	user_id?: string | null;
	name: string;
	bio?: string | null;
	specialties?: string[];
	avatar_url?: string | null;
}

export interface UserSearchResult {
	id: string;
	full_name: string;
	phone: string | null;
	avatar_url: string | null;
}

export interface CaretakerUpdate {
	name?: string;
	bio?: string | null;
	specialties?: string[];
	is_active?: boolean;
	avatar_url?: string | null;
}

export interface CaretakerSchedule {
	id: string;
	caretaker_id: string;
	day_of_week: number; // 0=Domingo, 6=Sábado
	start_time: string;  // HH:MM:SS
	end_time: string;    // HH:MM:SS
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CaretakerScheduleInsert {
	caretaker_id: string;
	day_of_week: number;
	start_time: string;
	end_time: string;
}

export interface CaretakerBlockedSlot {
	id: string;
	caretaker_id: string;
	blocked_date: string;  // YYYY-MM-DD
	start_time: string | null;
	end_time: string | null;
	reason: string | null;
	created_at: string;
}

export interface CaretakerWithSchedules extends Caretaker {
	schedules: CaretakerSchedule[];
	blocked_slots: CaretakerBlockedSlot[];
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export interface AdminStats {
	totalAppointmentsToday: number;
	pendingAppointments: number;
	confirmedAppointments: number;
	totalUsers: number;
	activeCaretakers: number;
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
