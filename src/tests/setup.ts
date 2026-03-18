import { vi } from 'vitest';

// Mock SvelteKit environment variables
vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
	PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
	PUBLIC_WHATSAPP_NUMBER: '5511999999999',
	PUBLIC_WHATSAPP_DEFAULT_MESSAGE: 'Test message',
	PUBLIC_SITE_URL: 'http://localhost:5173',
	PUBLIC_SITE_NAME: 'ArcPetShop Test'
}));

vi.mock('$env/static/private', () => ({
	TWILIO_ACCOUNT_SID: 'ACtest',
	TWILIO_AUTH_TOKEN: 'test-auth-token',
	TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886',
	SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
}));

vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_SITE_NAME: 'ArcPetShop Test',
		PUBLIC_SITE_URL: 'http://localhost:5173',
		PUBLIC_WHATSAPP_NUMBER: '5511999999999',
		PUBLIC_WHATSAPP_DEFAULT_MESSAGE: 'Test message'
	}
}));
