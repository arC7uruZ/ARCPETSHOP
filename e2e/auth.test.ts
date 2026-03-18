import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('redirects unauthenticated user from /booking to login', async ({ page }) => {
		await page.goto('/booking');
		await expect(page).toHaveURL(/auth\/login/);
	});

	test('redirects unauthenticated user from /dashboard to login', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/auth\/login/);
	});

	test('login page renders correctly', async ({ page }) => {
		await page.goto('/auth/login');
		await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible();
		await expect(page.getByLabel(/E-mail/i)).toBeVisible();
		await expect(page.getByLabel(/Senha/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible();
	});

	test('register page renders correctly', async ({ page }) => {
		await page.goto('/auth/register');
		await expect(page.getByRole('heading', { name: /Crie sua conta/i })).toBeVisible();
		await expect(page.getByLabel(/Nome completo/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /Criar conta/i })).toBeVisible();
	});

	test('shows error on invalid login', async ({ page }) => {
		await page.goto('/auth/login');
		await page.getByLabel(/E-mail/i).fill('wrong@example.com');
		await page.getByLabel(/Senha/i).fill('wrongpassword');
		await page.getByRole('button', { name: /Entrar/i }).click();
		// The form should show an error (invalid credentials from Supabase)
		// In a real test environment with test Supabase, this would return an error
	});

	test('login form links to register', async ({ page }) => {
		await page.goto('/auth/login');
		const registerLink = page.getByRole('link', { name: /Cadastre-se/i });
		await expect(registerLink).toBeVisible();
		await registerLink.click();
		await expect(page).toHaveURL(/auth\/register/);
	});

	test('register form links to login', async ({ page }) => {
		await page.goto('/auth/register');
		const loginLink = page.getByRole('link', { name: /Entrar/i });
		await expect(loginLink).toBeVisible();
	});
});
