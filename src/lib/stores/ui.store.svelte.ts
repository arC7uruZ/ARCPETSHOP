import type { Toast, ToastType } from '$lib/types';

let toasts = $state<Toast[]>([]);
let mobileMenuOpen = $state(false);

export const uiStore = {
	get toasts() {
		return toasts;
	},
	get mobileMenuOpen() {
		return mobileMenuOpen;
	},

	addToast(type: ToastType, message: string, duration = 4000) {
		const id = crypto.randomUUID();
		toasts = [...toasts, { id, type, message, duration }];
		if (duration > 0) {
			setTimeout(() => uiStore.removeToast(id), duration);
		}
	},

	removeToast(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	},

	success(message: string) {
		uiStore.addToast('success', message);
	},

	error(message: string) {
		uiStore.addToast('error', message, 6000);
	},

	warning(message: string) {
		uiStore.addToast('warning', message);
	},

	info(message: string) {
		uiStore.addToast('info', message);
	},

	toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	},

	closeMobileMenu() {
		mobileMenuOpen = false;
	}
};
