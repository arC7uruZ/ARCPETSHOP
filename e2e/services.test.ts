import { test, expect } from '@playwright/test';

test.describe('Services page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/services');
	});

	test('renders the services page header', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /Nossos Serviços/i })).toBeVisible();
	});

	test('displays all 6 services', async ({ page }) => {
		const serviceNames = [
			'Banho e Tosa',
			'Consulta Veterinária',
			'Vacinação',
			'Hospedagem Pet',
			'Adestramento',
			'Pet Taxi'
		];

		for (const name of serviceNames) {
			await expect(page.getByText(name)).toBeVisible();
		}
	});

	test('each service has a booking button', async ({ page }) => {
		const bookingButtons = page.getByRole('link', { name: /Agendar este serviço/i });
		const count = await bookingButtons.count();
		expect(count).toBeGreaterThanOrEqual(6);
	});

	test('booking button redirects to booking page', async ({ page }) => {
		const btn = page.getByRole('link', { name: /Agendar este serviço/i }).first();
		await btn.click();
		// Should redirect to login since not authenticated
		await expect(page).toHaveURL(/\/(booking|auth\/login)/);
	});
});
