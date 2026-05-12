import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

vi.mock('$lib/supabase/server', () => ({
	createServerSupabaseClient: vi.fn()
}));

import { handle } from './hooks.server';
import { createServerSupabaseClient } from '$lib/supabase/server';

const buildMockSupabase = () => ({
	auth: {
		getSession: vi.fn(),
		getUser: vi.fn()
	}
});

const buildMockEvent = (supabaseOverride?: object): Partial<RequestEvent> => ({
	cookies: {} as RequestEvent['cookies'],
	locals: { supabase: supabaseOverride } as RequestEvent['locals']
});

describe('hooks.server handle', () => {
	let mockSupabase: ReturnType<typeof buildMockSupabase>;
	let mockEvent: Partial<RequestEvent>;
	let mockResolve: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSupabase = buildMockSupabase();
		mockEvent = buildMockEvent();
		mockResolve = vi.fn().mockResolvedValue(new Response('ok'));
		vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as never);
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
	});

	it('should attach the supabase client to event.locals', async () => {
		await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });

		expect(createServerSupabaseClient).toHaveBeenCalledWith(mockEvent.cookies);
		expect(mockEvent.locals?.supabase).toBe(mockSupabase);
	});

	it('should attach safeGetSession function to event.locals', async () => {
		await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });

		expect(typeof mockEvent.locals?.safeGetSession).toBe('function');
	});

	it('should set session and user on locals when session is valid', async () => {
		const mockSession = { user: { id: 'user-1' } };
		const mockUser = { id: 'user-1', email: 'user@test.com' };
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
		mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

		await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });

		expect(mockEvent.locals?.session).toBe(mockSession);
		expect(mockEvent.locals?.user).toBe(mockUser);
	});

	it('should set null session and null user when there is no session', async () => {
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

		await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });

		expect(mockEvent.locals?.session).toBeNull();
		expect(mockEvent.locals?.user).toBeNull();
	});

	it('should call resolve with filterSerializedResponseHeaders option', async () => {
		await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });

		expect(mockResolve).toHaveBeenCalledWith(
			mockEvent,
			expect.objectContaining({ filterSerializedResponseHeaders: expect.any(Function) })
		);
	});

	it('should return the response from resolve', async () => {
		const mockResponse = new Response('response body');
		mockResolve.mockResolvedValue(mockResponse);

		const result = await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });

		expect(result).toBe(mockResponse);
	});

	describe('filterSerializedResponseHeaders', () => {
		let filterFn: (name: string) => boolean;

		beforeEach(async () => {
			await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });
			filterFn = mockResolve.mock.calls[0][1].filterSerializedResponseHeaders;
		});

		it('should return true for content-range', () => {
			expect(filterFn('content-range')).toBe(true);
		});

		it('should return true for x-supabase-api-version', () => {
			expect(filterFn('x-supabase-api-version')).toBe(true);
		});

		it('should return false for other headers', () => {
			expect(filterFn('authorization')).toBe(false);
			expect(filterFn('content-type')).toBe(false);
			expect(filterFn('x-custom-header')).toBe(false);
		});
	});
});

describe('safeGetSession', () => {
	let mockSupabase: ReturnType<typeof buildMockSupabase>;
	let mockEvent: Partial<RequestEvent>;
	let mockResolve: ReturnType<typeof vi.fn>;
	let safeGetSession: () => Promise<{ session: unknown; user: unknown }>;

	beforeEach(async () => {
		mockSupabase = buildMockSupabase();
		mockEvent = buildMockEvent();
		mockResolve = vi.fn().mockResolvedValue(new Response('ok'));
		vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as never);
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

		await handle({ event: mockEvent as RequestEvent, resolve: mockResolve });
		safeGetSession = mockEvent.locals!.safeGetSession;
	});

	it('should return { session: null, user: null } when there is no session', async () => {
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

		const result = await safeGetSession();

		expect(result).toEqual({ session: null, user: null });
		expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
	});

	it('should return validated user from getUser when session is valid', async () => {
		const mockSession = { user: { id: 'user-1' } };
		const mockUser = { id: 'user-1', email: 'user@test.com' };
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
		mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

		const result = await safeGetSession();

		expect(result).toEqual({ session: mockSession, user: mockUser });
	});

	it('should call getUser for server-side JWT validation when session exists', async () => {
		const mockSession = { user: { id: 'user-1' } };
		const mockUser = { id: 'user-1' };
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
		mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

		await safeGetSession();

		expect(mockSupabase.auth.getUser).toHaveBeenCalledOnce();
	});

	it('should fallback to session.user when getUser returns an error', async () => {
		const mockSession = { user: { id: 'user-1', email: 'user@test.com' } };
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
		mockSupabase.auth.getUser.mockResolvedValue({
			data: { user: null },
			error: new Error('Token expired')
		});

		const result = await safeGetSession();

		expect(result).toEqual({ session: mockSession, user: mockSession.user });
	});

	it('should not call getUser when there is no session', async () => {
		mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

		await safeGetSession();

		expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
	});
});
