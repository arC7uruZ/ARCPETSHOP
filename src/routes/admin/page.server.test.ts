import { describe, vi, expect, it } from "vitest";

vi.mock("$lib/server/admin.server", () => {
	return {
		fetchAdminStats: vi.fn(),
		fetchRecentAppointments: vi.fn()
	};
});

import {
	fetchAdminStats,
	fetchRecentAppointments
} from "$lib/server/admin.server";

import { load } from "./+page.server";

const mockLocals = {
    supabase: "mock",
}

describe("+page.server.ts load function", () => {
    it("should return stats and recentAppointments", async () => {
        vi.mocked(fetchAdminStats).mockResolvedValue("adminStats" as any)
        vi.mocked(fetchRecentAppointments).mockResolvedValue("recentAppointments" as any)
        const result = await load({ locals: mockLocals } as never)

        expect(fetchAdminStats).toHaveBeenCalledOnce();
        expect(fetchRecentAppointments).toHaveBeenCalledOnce();
        expect(result).toEqual({
            stats: "adminStats",
            recentAppointments: "recentAppointments",
        });
    })
})

