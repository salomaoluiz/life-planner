import { useMemo } from "react";

import { applyTarget } from "@application/csvImport/mapping";
import {
  ColumnTarget,
  FixedValues,
  RowType,
} from "@application/csvImport/types";

import { ImportWizardState } from "../useImportWizardViewModel";

const EXAMPLES = 3;
const FIXED_NONE = "";

const TARGETS: ColumnTarget[] = [
  "date",
  "description",
  "amount",
  "signedAmount",
  "incomeAmount",
  "expenseAmount",
  "type",
  "category",
  "account",
  "card",
  "paid",
  "tags",
  "currency",
  "ignore",
];

export interface ColumnRow {
  examples: string[];
  header: string;
  index: number;
  target: ColumnTarget;
}

// Up to 3 distinct non-empty values of the column (FR 13).
function distinctExamples(rows: string[][], column: number): string[] {
  const seen = new Set<string>();

  for (const row of rows) {
    const value = (row[column] ?? "").trim();

    if (value !== "") {
      seen.add(value);
    }
    if (seen.size === EXAMPLES) {
      break;
    }
  }

  return [...seen];
}

// Step 2 (spec 047 FR 13-21): what each column of the file represents and what is still missing.
function useColumnsStepViewModel(wizard: ImportWizardState) {
  const { fixed, mapping, rows } = wizard;
  const columns = useMemo<ColumnRow[]>(
    () =>
      wizard.headers.map((header, index) => ({
        examples: distinctExamples(rows, index),
        header,
        index,
        target: mapping[index] ?? "ignore",
      })),
    [wizard.headers, rows, mapping],
  );
  function has(target: ColumnTarget) {
    return Object.values(mapping).includes(target);
  }
  function status(field: string) {
    return wizard.statuses.find((item) => item.field === field);
  }
  const accountOrCard = status("accountOrCard");
  const records = wizard.records;

  return {
    columns,
    // The fixed selects only show for what the columns leave open (FR 18-19).
    fixedAccountOrCardOptions: [
      ...records.accounts.map((item) => ({
        label: item.name,
        value: `account:${item.id}`,
      })),
      ...records.cards.map((item) => ({
        label: item.name,
        value: `card:${item.id}`,
      })),
    ],
    fixedAccountOrCardValue: fixed.accountOrCard
      ? `${fixed.accountOrCard.kind}:${fixed.accountOrCard.id}`
      : FIXED_NONE,
    fixedCategoryOptions: records.categories.map((item) => ({
      label: item.path,
      value: item.id,
    })),
    fixedCategoryValue: fixed.categoryId ?? FIXED_NONE,
    fixedTypeValue: fixed.type ?? FIXED_NONE,
    mapped: {
      currency: has("currency"),
      paid: has("paid"),
      tags: has("tags"),
    },
    missingAccountRows: accountOrCard?.missingRows ?? 0,
    onFixedAccountOrCardChange: (value: string) => {
      const [kind, ...rest] = value.split(":");

      update({
        accountOrCard: value
          ? { id: rest.join(":"), kind: kind as "account" | "card" }
          : undefined,
      });
    },
    onFixedCategoryChange: (value: string) =>
      update({ categoryId: value || undefined }),
    onFixedTypeChange: (value: string) =>
      update({ type: (value || undefined) as RowType | undefined }),
    onTargetChange: (index: number, value: string) =>
      wizard.onMappingChange(
        applyTarget(mapping, index, value as ColumnTarget),
      ),
    // Category and type offer a fixed value when no column gives it; the account or card also for the rows a column
    // leaves empty.
    showFixedAccountOrCard:
      !accountOrCard?.ok ||
      accountOrCard.source === "fixed" ||
      accountOrCard.missingRows > 0,
    showFixedCategory:
      !has("category") ||
      (status("category")?.missingRows ?? 0) > 0 ||
      !!fixed.categoryId,
    showFixedType: has("amount") && !has("type"),
    statuses: wizard.statuses,
    targets: TARGETS,
  };

  function update(next: Partial<FixedValues>) {
    wizard.onFixedChange({ ...fixed, ...next });
  }
}

export default useColumnsStepViewModel;
