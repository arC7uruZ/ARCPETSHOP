import { describe, expect, it, vi } from "vitest";

vi.mock("$lib/server/admin.server", () => ({
	fetchAllUsers: vi.fn()
}));

import { load } from "./+page.server";
import { fetchAllUsers } from "$lib/server/admin.server";

let mockParent = vi.fn();
let mockLocals = {
	supabase: "mockSupabase"
};

describe("+page.server.ts load function", () => {
	it("should redirect to /admin because the user is not admin nor root_admin", async () => {
		mockParent.mockResolvedValue({
			userRole: "notAdmin"
		});

		await expect(
			load({ locals: mockLocals, parent: mockParent } as never)
		).rejects.toMatchObject({
			status: 303,
			location: "/admin"
		});

		expect(fetchAllUsers).not.toHaveBeenCalled();
	});

	it("should return users received from the database", async () => {
		mockParent.mockResolvedValue({
			userRole: "admin"
		});

		vi.mocked(fetchAllUsers).mockResolvedValue(["user1", "user2"] as never);

		const result = await load({
			locals: mockLocals,
			parent: mockParent
		} as never);

		expect(result).toEqual({
			users: ["user1", "user2"]
		});

        expect(fetchAllUsers).toHaveBeenCalledOnce();
	});
});
