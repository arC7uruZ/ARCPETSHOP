import { describe, it, expect, vi, beforeEach } from 'vitest';

import { load } from './+layout.server';

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = { session: unknown; user: unknown; cookies: { name: string; value: string }[] };

const buildMockLocals = (sessionOverride: unknown = null, userOverride: unknown = null) =>
	({
		safeGetSession: vi.fn().mockResolvedValue({ session: sessionOverride, user: userOverride })
	}) as unknown as LoadEvent['locals'];

const buildMockCookies = (allCookies: { name: string; value: string }[] = []) =>
	({
		getAll: vi.fn().mockReturnValue(allCookies)
	}) as unknown as LoadEvent['cookies'];

describe('+layout.server load', () => {
	let mockLocals: LoadEvent['locals'];
	let mockCookies: LoadEvent['cookies'];

	beforeEach(() => {
		mockLocals = buildMockLocals();
		mockCookies = buildMockCookies();
	});

	it('should call safeGetSession from locals', async () => {
		await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent);

		expect(mockLocals.safeGetSession).toHaveBeenCalledOnce();
	});

	it('should call cookies.getAll to forward cookies to the client layout', async () => {
		await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent);

		expect(mockCookies.getAll).toHaveBeenCalledOnce();
	});

	it('should return session, user and cookies in the data object', async () => {
		const result = (await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent)) as LoadResult;

		expect(result).toHaveProperty('session');
		expect(result).toHaveProperty('user');
		expect(result).toHaveProperty('cookies');
	});

	it('should return null session and null user when the user is not authenticated', async () => {
		const result = (await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent)) as LoadResult;

		expect(result.session).toBeNull();
		expect(result.user).toBeNull();
	});

	it('should return the session and user provided by safeGetSession', async () => {
		const mockSession = { access_token: 'token-abc', user: { id: 'user-1' } };
		const mockUser = { id: 'user-1', email: 'user@test.com' };
		mockLocals = buildMockLocals(mockSession, mockUser);

		const result = (await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent)) as LoadResult;

		expect(result.session).toBe(mockSession);
		expect(result.user).toBe(mockUser);
	});

	it('should return all cookies from cookies.getAll', async () => {
		const allCookies = [
			{ name: 'sb-access-token', value: 'token-abc' },
			{ name: 'sb-refresh-token', value: 'refresh-xyz' }
		];
		mockCookies = buildMockCookies(allCookies);

		const result = (await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent)) as LoadResult;

		expect(result.cookies).toEqual(allCookies);
	});

	it('should return an empty cookies array when there are no cookies', async () => {
		const result = (await load({ locals: mockLocals, cookies: mockCookies } as unknown as LoadEvent)) as LoadResult;

		expect(result.cookies).toEqual([]);
	});
});
