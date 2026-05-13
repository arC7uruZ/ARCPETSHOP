import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/ssr', () => ({
	createBrowserClient: vi.fn(),
	createServerClient: vi.fn(),
	isBrowser: vi.fn()
}));

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
	PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
}));

import { load } from './+layout';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = { session: unknown; supabase: unknown; user: unknown };

const buildMockEvent = (
	dataOverride: Partial<{ session: unknown; user: unknown; cookies: { name: string; value: string }[] }> = {}
): LoadEvent =>
	({
		data: { session: null, user: null, cookies: [], ...dataOverride },
		depends: vi.fn(),
		fetch: vi.fn()
	}) as unknown as LoadEvent;

describe('+layout load', () => {
	let mockEvent: LoadEvent;
	const mockSupabaseClient = { auth: {} };

	beforeEach(() => {
		vi.clearAllMocks();
		mockEvent = buildMockEvent();
		vi.mocked(isBrowser).mockReturnValue(false);
		vi.mocked(createBrowserClient).mockReturnValue(mockSupabaseClient as never);
		vi.mocked(createServerClient).mockReturnValue(mockSupabaseClient as never);
	});

	it('should call depends with supabase:auth', async () => {
		await load(mockEvent);

		expect(mockEvent.depends).toHaveBeenCalledWith('supabase:auth');
	});

	describe('when running in the browser', () => {
		beforeEach(() => {
			vi.mocked(isBrowser).mockReturnValue(true);
		});

		it('should call createBrowserClient with the correct url and anon key', async () => {
			await load(mockEvent);

			expect(createBrowserClient).toHaveBeenCalledWith(
				'https://test.supabase.co',
				'test-anon-key',
				expect.objectContaining({ global: { fetch: mockEvent.fetch } })
			);
		});

		it('should not call createServerClient', async () => {
			await load(mockEvent);

			expect(createServerClient).not.toHaveBeenCalled();
		});
	});

	describe('when running on the server (SSR)', () => {
		beforeEach(() => {
			vi.mocked(isBrowser).mockReturnValue(false);
		});

		it('should call createServerClient with the correct url and anon key', async () => {
			await load(mockEvent);

			expect(createServerClient).toHaveBeenCalledWith(
				'https://test.supabase.co',
				'test-anon-key',
				expect.objectContaining({ global: { fetch: mockEvent.fetch } })
			);
		});

		it('should not call createBrowserClient', async () => {
			await load(mockEvent);

			expect(createBrowserClient).not.toHaveBeenCalled();
		});

		it('cookies.getAll passed to createServerClient should return data.cookies', async () => {
			const cookies = [{ name: 'sb-token', value: 'abc' }];
			mockEvent = buildMockEvent({ cookies });

			await load(mockEvent);

			const options = vi.mocked(createServerClient).mock.calls[0][2] as {
				cookies: { getAll: () => unknown };
			};
			expect(options.cookies.getAll()).toEqual(cookies);
		});
	});

	describe('return value', () => {
		it('should return the session from data', async () => {
			const session = { access_token: 'token-abc', user: { id: 'user-1' } };
			mockEvent = buildMockEvent({ session });

			const result = (await load(mockEvent)) as LoadResult;

			expect(result.session).toBe(session);
		});

		it('should return the user from data', async () => {
			const user = { id: 'user-1', email: 'user@test.com' };
			mockEvent = buildMockEvent({ user });

			const result = (await load(mockEvent)) as LoadResult;

			expect(result.user).toBe(user);
		});

		it('should return the supabase client', async () => {
			const result = (await load(mockEvent)) as LoadResult;

			expect(result.supabase).toBe(mockSupabaseClient);
		});
	});
});
