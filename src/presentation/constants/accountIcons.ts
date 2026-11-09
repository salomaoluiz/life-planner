import { AccountType } from "@domain/entities/financial/AccountEntity";

const ACCOUNT_ICONS = [
  "bank",
  "wallet",
  "credit-card",
  "piggy-bank",
  "cash",
  "safe",
  "chart-line",
  "home",
  "briefcase",
  "cellphone",
];

// Spec 101: the icon a type suggests while the user has not picked one by hand.
const DEFAULT_ICON_BY_TYPE: Record<AccountType, string> = {
  [AccountType.BROKERAGE]: "chart-line",
  [AccountType.CASH]: "cash",
  [AccountType.CHECKING]: "bank",
  [AccountType.OTHER]: "wallet",
  [AccountType.SAVINGS]: "piggy-bank",
};

export { ACCOUNT_ICONS, DEFAULT_ICON_BY_TYPE };
