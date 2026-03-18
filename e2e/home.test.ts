import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('renders hero section', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByText(/Agendar agora/i)).toBeVisible();
	});

	test('renders WhatsApp CTA button in hero', async ({ page }) => {
		const whatsappBtn = page.getByRole('link', { name: /Falar no WhatsApp/i }).first();
		await expect(whatsappBtn).toBeVisible();
		const href = await whatsappBtn.getAttribute('href');
		expect(href).toContain('wa.me');
	});

	test('renders services preview section', async ({ page }) => {
		await expect(page.getByText(/Nossos Serviços/i)).toBeVisible();
	});

	test('renders testimonials', async ({ page }) => {
		await expect(page.getByText(/clientes/i)).toBeVisible();
	});

	test('renders WhatsApp CTA section', async ({ page }) => {
		await expect(page.getByText(/Fale conosco pelo WhatsApp/i)).toBeVisible();
	});

	test('has navigation with correct links', async ({ page }) => {
		await expect(page.getByRole('link', { name: 'Serviços' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Agendar' })).toBeVisible();
	});

	test('has footer with contact information', async ({ page }) => {
		await expect(page.locator('footer')).toBeVisible();
	});
});
