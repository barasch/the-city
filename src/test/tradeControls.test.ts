import { describe, expect, it } from "vitest";
import {
  maximumTradeQuantity,
  normalizeTradeQuantity,
} from "../game/tradeControls";

describe("market quantity controls", () => {
  it("normalizes empty and invalid input to zero", () => {
    expect(normalizeTradeQuantity(Number.NaN)).toBe(0);
    expect(normalizeTradeQuantity(-4)).toBe(0);
    expect(normalizeTradeQuantity(3.9)).toBe(3);
  });

  it("reports the largest available buy or sell quantity without transacting", () => {
    expect(maximumTradeQuantity(42, 0)).toBe(42);
    expect(maximumTradeQuantity(7, 19)).toBe(19);
    expect(maximumTradeQuantity(0, 0)).toBe(0);
  });
});
