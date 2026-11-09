import { AccountType } from "@domain/entities/financial/AccountEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

import AccountUIModel from "./AccountUIModel";

export type AccountEntry =
  | { account: AccountUIModel; key: string; kind: "row" }
  | { count: number; expanded: boolean; key: string; kind: "archivedToggle" }
  | {
      count: number;
      key: string;
      kind: "typeSection";
      subtotalCents: number;
      titleKey: TranslationKeys;
      type: AccountType;
    };

// Spec 101: the order of the sections of the active accounts.
const ACCOUNT_TYPE_ORDER: AccountType[] = [
  AccountType.CHECKING,
  AccountType.SAVINGS,
  AccountType.BROKERAGE,
  AccountType.CASH,
  AccountType.OTHER,
];

const ACCOUNT_TYPE_LABEL_KEYS: Record<AccountType, TranslationKeys> = {
  [AccountType.BROKERAGE]: "financial.accounts.types.BROKERAGE",
  [AccountType.CASH]: "financial.accounts.types.CASH",
  [AccountType.CHECKING]: "financial.accounts.types.CHECKING",
  [AccountType.OTHER]: "financial.accounts.types.OTHER",
  [AccountType.SAVINGS]: "financial.accounts.types.SAVINGS",
};

function buildAccountEntries(
  accounts: AccountUIModel[],
  archivedExpanded: boolean,
): AccountEntry[] {
  const active = favoriteFirst(
    accounts.filter((account) => !account.isArchived).sort(byName),
  );
  const archived = accounts
    .filter((account) => account.isArchived)
    .sort(byName);
  const entries: AccountEntry[] = [];

  for (const type of ACCOUNT_TYPE_ORDER) {
    const ofType = active.filter((account) => account.type === type);

    if (ofType.length > 0) {
      entries.push(
        {
          count: ofType.length,
          key: `type-section-${type}`,
          kind: "typeSection",
          subtotalCents: totalActiveCents(ofType),
          titleKey: ACCOUNT_TYPE_LABEL_KEYS[type],
          type,
        },
        ...rows(ofType),
      );
    }
  }

  if (archived.length > 0) {
    entries.push({
      count: archived.length,
      expanded: archivedExpanded,
      key: "archived-toggle",
      kind: "archivedToggle",
    });
    if (archivedExpanded) {
      entries.push(...rows(archived));
    }
  }

  return entries;
}

function byName(a: AccountUIModel, b: AccountUIModel) {
  return a.name.localeCompare(b.name);
}

// Spec 094.2 FR 1: the favorite (when it is in the list) opens the Active section; the others keep their order.
function favoriteFirst(accounts: AccountUIModel[]) {
  const favorite = accounts.find((account) => account.isFavorite);

  return favorite
    ? [favorite, ...accounts.filter((account) => account !== favorite)]
    : accounts;
}

// "All" leaves out the archived families (spec 042); selecting one shows its data.
function filterByOwner(
  accounts: AccountUIModel[],
  ownerFilter: string,
  archivedOwnerIds: ReadonlySet<string> = new Set(),
) {
  if (ownerFilter === ALL_OWNERS) {
    return archivedOwnerIds.size === 0
      ? accounts
      : accounts.filter((account) => !archivedOwnerIds.has(account.ownerId));
  }

  return accounts.filter((account) => account.ownerId === ownerFilter);
}

function rows(accounts: AccountUIModel[]): AccountEntry[] {
  return accounts.map((account) => ({
    account,
    key: `row-${account.id}`,
    kind: "row",
  }));
}

function totalActiveCents(accounts: AccountUIModel[]) {
  return accounts
    .filter((account) => !account.isArchived)
    .reduce((sum, account) => sum + account.balanceCents, 0);
}

function totalAmount(cents: number): { type?: "EXPENSE"; value: number } {
  if (cents < 0) {
    return { type: "EXPENSE", value: Math.abs(cents) };
  }

  return { value: cents };
}

function totalProjectedCents(accounts: AccountUIModel[]) {
  return accounts
    .filter((account) => !account.isArchived)
    .reduce((sum, account) => sum + account.projectedBalanceCents, 0);
}

export {
  ACCOUNT_TYPE_LABEL_KEYS,
  ACCOUNT_TYPE_ORDER,
  buildAccountEntries,
  filterByOwner,
  totalActiveCents,
  totalAmount,
  totalProjectedCents,
};
