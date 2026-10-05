import { TranslationKeys } from "@presentation/i18n/types";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

import AccountUIModel from "./AccountUIModel";

export type AccountEntry =
  | { account: AccountUIModel; key: string; kind: "row" }
  | { count: number; expanded: boolean; key: string; kind: "archivedToggle" }
  | { key: string; kind: "section"; titleKey: TranslationKeys };

function buildAccountEntries(
  accounts: AccountUIModel[],
  archivedExpanded: boolean,
): AccountEntry[] {
  const active = accounts.filter((account) => !account.isArchived).sort(byName);
  const archived = accounts
    .filter((account) => account.isArchived)
    .sort(byName);
  const entries: AccountEntry[] = [];

  if (active.length > 0) {
    entries.push(
      {
        key: "section-active",
        kind: "section",
        titleKey: "financial.accounts.active",
      },
      ...rows(active),
    );
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

function filterByOwner(accounts: AccountUIModel[], ownerFilter: string) {
  if (ownerFilter === ALL_OWNERS) {
    return accounts;
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

export { buildAccountEntries, filterByOwner, totalActiveCents, totalAmount };
