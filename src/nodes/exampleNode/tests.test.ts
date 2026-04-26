import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { run } from "./implementation.js";

describe("normalizeText", () => {
  it("trims whitespace", () => {
    expect(run({ text: "  hello world  " })).toEqual({
      normalized: "hello world"
    });
  });

  it("collapses repeated whitespace into one space", () => {
    expect(run({ text: "hello \n\t  world" })).toEqual({
      normalized: "hello world"
    });
  });

  it("preserves normal words", () => {
    expect(run({ text: "alpha beta gamma" })).toEqual({
      normalized: "alpha beta gamma"
    });
  });

  it("is deterministic", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(run({ text })).toEqual(run({ text }));
      })
    );
  });

  it("never returns leading, trailing, or repeated whitespace", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const { normalized } = run({ text });
        expect(normalized).toBe(normalized.trim());
        expect(/\s{2,}/u.test(normalized)).toBe(false);
      })
    );
  });
});
