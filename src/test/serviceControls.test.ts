import { describe, expect, it } from "vitest";
import {
  maximumServiceAmount,
  serviceAmountError,
} from "../game/serviceControls";

describe("service amount controls", () => {
  const balances = { cash: 3200, bank: 1400, debt: 4100 };

  it("sets action-specific maximums", () => {
    expect(maximumServiceAmount("deposit", balances)).toBe(3200);
    expect(maximumServiceAmount("withdraw", balances)).toBe(1400);
    expect(maximumServiceAmount("borrow", balances)).toBe(25000);
    expect(maximumServiceAmount("repay", balances)).toBe(3200);
  });

  it("explains unavailable credit and impossible transfers", () => {
    expect(serviceAmountError("borrow", 25000, balances)).toBeUndefined();
    expect(serviceAmountError("repay", 4100, balances)).toContain(
      "cash you actually have",
    );
    expect(serviceAmountError("deposit", 3201, balances)).toContain(
      "cash to deposit",
    );
  });
});
