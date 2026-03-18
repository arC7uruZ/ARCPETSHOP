import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '$lib/types';

let user = $state<User | null>(null);
let session = $state<Session | null>(null);
let profile = $state<Profile | null>(null);
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
	get loading() {
		return loading;
	},
	get isAuthenticated() {
		return !!user;
	},

	setSession(s: Session | null) {
		session = s;
		user = s?.user ?? null;
		loading = false;
	},

	setProfile(p: Profile | null) {
		profile = p;
	},

	setLoading(val: boolean) {
		loading = val;
	},

	clear() {
		user = null;
		session = null;
		profile = null;
		loading = false;
	}
};
