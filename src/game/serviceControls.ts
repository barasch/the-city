import { LOAN_SHARK_CREDIT_LIMIT } from "./engine";

export type ServiceAction = "deposit" | "withdraw" | "borrow" | "repay";

export interface ServiceBalances {
  cash: number;
  bank: number;
  debt: number;
}

export function maximumServiceAmount(
  action: ServiceAction,
  balances: ServiceBalances,
): number {
  switch (action) {
    case "deposit":
      return Math.max(0, Math.floor(balances.cash));
    case "withdraw":
      return Math.max(0, Math.floor(balances.bank));
    case "borrow":
      return Math.max(0, Math.floor(LOAN_SHARK_CREDIT_LIMIT - balances.debt));
    case "repay":
      return Math.max(0, Math.floor(balances.debt));
  }
}

export function serviceAmountError(
  action: ServiceAction,
  amount: number,
  balances: ServiceBalances,
): string | undefined {
  const whole = Math.floor(amount);
  if (!Number.isFinite(amount) || whole <= 0) return "Enter a dollar amount.";
  if (action === "deposit" && whole > balances.cash)
    return "You do not have that much cash to deposit.";
  if (action === "withdraw" && whole > balances.bank)
    return "The account does not hold that much.";
  if (action === "repay" && whole > balances.debt)
    return "You do not owe that much.";
  if (action === "repay" && whole > balances.cash)
    return "The loan shark wants cash you actually have.";
  if (action === "borrow") {
    const available = maximumServiceAmount(action, balances);
    if (whole > available)
      return available > 0
        ? `The loan shark taps the ledger. Only $${available.toLocaleString()} is available.`
        : `The loan shark laughs. Get the debt below $${LOAN_SHARK_CREDIT_LIMIT.toLocaleString()} before asking again.`;
  }
  return undefined;
}
