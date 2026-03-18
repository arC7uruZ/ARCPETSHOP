import type { Service, Pet } from '$lib/types';

interface BookingState {
	step: number;
	selectedService: Service | null;
	selectedPet: Pet | null;
	selectedDate: string;
	selectedTime: string;
	notes: string;
}

let step = $state(1);
let selectedService = $state<Service | null>(null);
let selectedPet = $state<Pet | null>(null);
let selectedDate = $state('');
let selectedTime = $state('');
let notes = $state('');

export const bookingStore = {
	get step() {
		return step;
	},
	get selectedService() {
		return selectedService;
	},
	get selectedPet() {
		return selectedPet;
	},
	get selectedDate() {
		return selectedDate;
	},
	get selectedTime() {
		return selectedTime;
	},
	get notes() {
		return notes;
	},
	get canProceedFromStep1() {
		return !!selectedService;
	},
	get canProceedFromStep2() {
		return !!selectedPet;
	},
	get canProceedFromStep3() {
		return !!selectedDate && !!selectedTime;
	},

	setService(service: Service | null) {
		selectedService = service;
	},
	setPet(pet: Pet | null) {
		selectedPet = pet;
	},
	setDate(date: string) {
		selectedDate = date;
		selectedTime = '';
	},
	setTime(time: string) {
		selectedTime = time;
	},
	setNotes(value: string) {
		notes = value;
	},
	nextStep() {
		if (step < 4) step++;
	},
	prevStep() {
		if (step > 1) step--;
	},
	goToStep(n: number) {
		step = n;
	},
	reset() {
		step = 1;
		selectedService = null;
		selectedPet = null;
		selectedDate = '';
		selectedTime = '';
		notes = '';
	}
};

export type { BookingState };
