import { describe, vi, expect, it, beforeEach } from "vitest";

vi.mock('$lib/server', () => ({
	fetchProfile: vi.fn(),
}));

vi.mock('$lib/server/permissions.server', () => ({
	getUserPermissions: vi.fn(),
}));

import { load } from "./+layout.server";
import { fetchProfile } from "$lib/server";
import { getUserPermissions } from "$lib/server/permissions.server"

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = {
	userRole: unknown;
	adminName: unknown;
	permissions: unknown;
};

const mockLocalsFactory = (mockUser: unknown = null) => {
	return {
		user: mockUser,
		supabase: vi.fn()
	} as unknown as LoadEvent["locals"];
};

describe("+layout.server.ts load", () => {
	let mockLocals: LoadEvent["locals"];

	beforeEach(() => {
		mockLocals = mockLocalsFactory();
	});

	it("should redirect to login if a user doesn't exists in locals", async () => {
		await expect(
			load({ locals: mockLocals } as unknown as LoadEvent)
		).rejects.toMatchObject({
			status: 303,
			location: "/login?redirectTo=/admin"
		});
	});

	it("should redirect to profile because the user doesn't have permissions", async () => {
		mockLocals = mockLocalsFactory("user");
        vi.mocked(fetchProfile).mockReturnValue({ role: "teste"} as never);

		await expect(
			load({ locals: mockLocals } as unknown as LoadEvent)
		).rejects.toMatchObject({
			status: 303,
			location: "/profile"
		});

        expect(fetchProfile).toHaveBeenCalled();
	});

    it("should return a valid object", async () => {
        mockLocals = mockLocalsFactory("user");
        vi.mocked(fetchProfile).mockReturnValue({ role: "admin", full_name: "adminFullName"} as never)
        vi.mocked(getUserPermissions).mockReturnValue(["criar", "alterar", "consultar", "apagar"] as never)

        const result = await load({ locals: mockLocals} as unknown as LoadEvent)

        expect(result).toStrictEqual({
            userRole: "admin",
            adminName: "adminFullName",
            permissions: [
                "criar", "alterar", "consultar", "apagar",
            ]
        })
    })
});
