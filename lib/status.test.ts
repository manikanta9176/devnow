import { describe, expect, test } from "vitest";
import { decodeStatus, encodeStatus, validateDraft } from "./status";

const draft = {
  text: "  Shipping the status page  ",
  link: "  https://example.com  ",
};

describe("validateDraft", () => {
  test("trims a valid draft", () => {
    expect(validateDraft(draft)).toEqual({
      ok: true,
      value: {
        text: "Shipping the status page",
        link: "https://example.com",
      },
    });
  });

  test("rejects a blank status", () => {
    expect(validateDraft({ ...draft, text: "   " })).toEqual({
      ok: false,
      error: "Write what you're on",
    });
  });

  test("rejects a non-http link", () => {
    expect(validateDraft({ ...draft, link: "notes://x" })).toEqual({
      ok: false,
      error: "Enter an http or https link",
    });
  });

  test("accepts an empty link", () => {
    const result = validateDraft({ ...draft, link: "  " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.link).toBe("");
  });

  test("returns the text error before the link error", () => {
    expect(validateDraft({ text: " ", link: "notes://x" })).toEqual({
      ok: false,
      error: "Write what you're on",
    });
  });
});

describe("encodeStatus", () => {
  const status = {
    text: "Shipping the status page",
    link: "https://example.com",
    updatedAt: "2026-10-16T09:30:00.000Z",
  };

  test("round-trips a status", () => {
    expect(decodeStatus(encodeStatus(status))).toEqual(status);
  });

  test("returns null for a bad payload", () => {
    expect(decodeStatus("not-a-status")).toBeNull();
  });
});
