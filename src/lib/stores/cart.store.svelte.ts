import { browser } from '$app/environment';
import type { CartItem } from '$lib/types';

const STORAGE_KEY = 'arcpetshop_cart';
const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 15;

let _items = $state<CartItem[]>([]);

if (browser) {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) _items = JSON.parse(stored);
	} catch {
		// ignore parse errors
	}
}

function persist() {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(_items));
	}
}

export const cartStore = {
	get items() {
		return _items;
	},
	get count() {
		return _items.reduce((s, i) => s + i.quantity, 0);
	},
	get subtotal() {
		return _items.reduce((s, i) => s + i.price * i.quantity, 0);
	},
	get shipping() {
		const sub = _items.reduce((s, i) => s + i.price * i.quantity, 0);
		return sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
	},
	get total() {
		const sub = _items.reduce((s, i) => s + i.price * i.quantity, 0);
		const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
		return sub + ship;
	},

	add(item: Omit<CartItem, 'quantity'>, qty = 1) {
		const existing = _items.find((i) => i.productId === item.productId);
		if (existing) {
			_items = _items.map((i) =>
				i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i
			);
		} else {
			_items = [..._items, { ...item, quantity: qty }];
		}
		persist();
	},

	remove(productId: string) {
		_items = _items.filter((i) => i.productId !== productId);
		persist();
	},

	setQty(productId: string, qty: number) {
		if (qty <= 0) {
			cartStore.remove(productId);
			return;
		}
		_items = _items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i));
		persist();
	},

	clear() {
		_items = [];
		persist();
	}
};
