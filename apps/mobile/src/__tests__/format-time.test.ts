import { formatRelativeTime } from "@/lib/format-time";

describe("formatRelativeTime", () => {
  it("returns 'Just now' for < 1 minute", () => {
    expect(formatRelativeTime(Date.now() - 30 * 1000)).toBe("Just now");
  });

  it("returns '5m ago' at 5 minutes", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe("5m ago");
  });

  it("returns '2h ago' at 2 hours", () => {
    expect(formatRelativeTime(Date.now() - 2 * 60 * 60 * 1000)).toBe("2h ago");
  });

  it("returns '3d ago' at 3 days", () => {
    expect(formatRelativeTime(Date.now() - 3 * 24 * 60 * 60 * 1000)).toBe("3d ago");
  });

  it("returns date string for 7+ days", () => {
    const ts = Date.now() - 10 * 24 * 60 * 60 * 1000;
    const result = formatRelativeTime(ts);
    // Should be a date string like "1/15/2026" not "10d ago"
    expect(result).not.toContain("ago");
    expect(result).toMatch(/\d/);
  });
});
