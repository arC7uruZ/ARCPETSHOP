import { it, describe, expect, vi } from "vitest";
import {
    combineDateAndTime,
	formatDate,
	formatDateShort,
	formatDateTime,
	formatDuration,
	formatTime,
	getAvailableTimeSlots,
	getMaxBookingDate,
	getMinBookingDate,
	isPastDate
} from "./date.utils";

describe("formatDate function test", () => {
	it("should return a valid string date", () => {
		const iso8601Date = "2026-05-08T17:22:00.000Z";

		const resultDate = formatDate(iso8601Date);

		expect(resultDate).toBe("8 de maio de 2026");
	});

	it("should return a '-' because received a invalid string", () => {
		const invalidString = "invalidString";

		const result = formatDate(invalidString);

		expect(result).toBe("-");
	});
});

describe("formatDateShort function test", () => {
	it("should return a valid string short date", () => {
		const iso8601Date = "2026-05-08T17:22:00.000Z";

		const resultDate = formatDateShort(iso8601Date);

		expect(resultDate).toBe("08/05/2026");
	});

	it("should return a '-' because received a invalid string", () => {
		const invalidString = "invalidString";

		const result = formatDateShort(invalidString);

		expect(result).toBe("-");
	});
});

describe("formatTime function test", () => {
	it("should return a valid string time", () => {
		const iso8601Date = "2026-05-08T17:22:00.000Z";

		const resultDate = formatTime(iso8601Date);

		expect(resultDate).toBe("14:22");
	});

	it("should return a '-' because received a invalid string", () => {
		const invalidString = "invalidString";

		const result = formatTime(invalidString);

		expect(result).toBe("-");
	});
});

describe("formatDateTime function test", () => {
	it("should return a valid string datetime", () => {
		const iso8601Date = "2026-05-08T17:22:00.000Z";

		const resultDate = formatDateTime(iso8601Date);

		expect(resultDate).toBe("08/05/2026 às 14:22");
	});

	it("should return a '-' because received a invalid string", () => {
		const invalidString = "invalidString";

		const result = formatDate(invalidString);

		expect(result).toBe("-");
	});
});

describe("formatDuration function test", () => {
	it("should return a valid string for hour and minute", () => {
		const numberOfMinutes = 3546;

		const result = formatDuration(numberOfMinutes);

		expect(result).toBe("59h 6min");
	});
});

describe("getAvailableTimeSlots function test", () => {
	it("should return a valid array of strings containing hours and minutes", () => {
		const inputDate = new Date("31-01-2025T13:47:28.000Z");

		const result = getAvailableTimeSlots(inputDate);

		expect(result).toEqual([
			"08:00",
			"08:30",
			"09:00",
			"09:30",
			"10:00",
			"10:30",
			"11:00",
			"11:30",
			"12:00",
			"12:30",
			"13:00",
			"13:30",
			"14:00",
			"14:30",
			"15:00",
			"15:30",
			"16:00",
			"16:30",
			"17:00",
			"17:30"
		]);
	});
});

describe("isPastDate function test", () => {
	it("should return true, because the provide date is before the 'actual' date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-08T17:22:00.000Z"));
		const pastDate = new Date("2026-03-08T11:52:00.000Z");

		const result = isPastDate(pastDate);

		expect(result).toBeTruthy();
		vi.useRealTimers();
	});

	it("should return false because the provided date is after the 'actual' date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-08T17:22:00.000Z"));
		const futureDate = new Date("2026-08-08T11:52:00.000Z");

		const result = isPastDate(futureDate);

		expect(result).toBeFalsy();
		vi.useRealTimers();
	});
});

describe("getMinBookingDate function test", () => {
	it("should return a date one day after the actual date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-06T17:22:00.000Z"));
		const result = getMinBookingDate();

		expect(result).toBe("2026-05-07");
		vi.useRealTimers();
	});
});

describe("getMaxBookingDate function test", () => {
	it("should return a date 30 days after the actual date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-06T17:22:00.000Z"));
		const result = getMaxBookingDate();

		expect(result).toBe("2026-06-05");
		vi.useRealTimers();
	});
});

describe("CombineDateAndTime function test", () => {
	it("should return a valid string containing de ISO format of the inputs", () => {

        const inputDate = "2026-06-05";
        const inputTime = "14:53";

		const result = combineDateAndTime(inputDate, inputTime);

		expect(result).toBe("2026-06-05T17:53:00.000Z");
	});

    it("should return a '-' because either date or time is invalid", () => {

        const invalidDate = "invalid date";
        const inputTime = "13:22";

        const result = combineDateAndTime(invalidDate, inputTime);

        expect(result).toBe("-");
    })
});
