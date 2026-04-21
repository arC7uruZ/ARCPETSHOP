import type { Session, User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '$lib/types';
import { hasPermission } from '$lib/utils/permissions';

let user = $state<User | null>(null);
let session = $state<Session | null>(null);
let profile = $state<Profile | null>(null);
let permissions = $state<string[]>([]);
let loading = $state(true);

export const authStore = {
	get user() {
		return user;
	},
	get session() {
		return session;
	},
	get profile() {
		return profile;
	},
	get permissions() {
		return permissions;
	},
	get loading() {
		return loading;
	},
	get isAuthenticated() {
		return !!user;
	},
	get isAdmin() {
		return profile?.role === 'admin' || profile?.role === 'root_admin';
	},
	get isRootAdmin() {
		return profile?.role === 'root_admin';
	},
	get isCaretaker() {
		return profile?.role === 'caretaker';
	},

	can(permission: string): boolean {
		if (!profile) return false;
		return hasPermission(profile.role as UserRole, permissions, permission);
	},

	setSession(s: Session | null) {
		session = s;
		user = s?.user ?? null;
		loading = false;
	},

	setProfile(p: Profile | null) {
		profile = p;
	},

	setPermissions(p: string[]) {
		permissions = p;
	},

	setLoading(val: boolean) {
		loading = val;
	},

	clear() {
		user = null;
		session = null;
		profile = null;
		permissions = [];
		loading = false;
	}
};
