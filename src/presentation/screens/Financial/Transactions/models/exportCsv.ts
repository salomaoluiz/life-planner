import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  ExportFormat,
  ExportQuery,
} from "@domain/entities/financial/TransactionCsv";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

import {
  FilterPeriod,
  periodPreset,
  toDateKey,
  validatePeriod,
} from "./transactionFilters";

// Spec 047 FR 2: the presets of the export period; "This year" is the default.
export type ExportPreset = "LAST_12_MONTHS" | "THIS_MONTH" | "THIS_YEAR";

export const EXPORT_PRESETS: ExportPreset[] = [
  "THIS_MONTH",
  "LAST_12_MONTHS",
  "THIS_YEAR",
];

export interface ExportDraft {
  accountIds: string[];
  cardIds: string[];
  // `ALL_OWNERS` or an owner id (Personal or a family, archived ones included).
  ownerSelection: string;
  period: FilterPeriod;
}

// pt-BR → Brazil (`;`, decimal comma, dd/mm/yyyy); anything else → International (spec 047 FR 2).
function defaultExportFormat(languageTag: string): ExportFormat {
  return languageTag.toLowerCase().startsWith("pt") ? "BR" : "INTL";
}

function exportPreset(kind: ExportPreset, today: Date): FilterPeriod {
  if (kind !== "LAST_12_MONTHS") {
    return periodPreset(kind, today);
  }

  return {
    from: toDateKey(new Date(today.getFullYear(), today.getMonth() - 11, 1)),
    to: toDateKey(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

// `ALL_OWNERS` → ALL; the Personal owner → USER; a family id → FAMILY with its id.
function exportScope(
  selection: string,
  owners: OwnerDTO[],
): Pick<ExportQuery, "owner" | "ownerId"> {
  if (selection === ALL_OWNERS) {
    return { owner: "ALL" };
  }

  const owner = owners.find((item) => item.id === selection);

  return owner?.type === OwnerType.FAMILY
    ? { owner: "FAMILY", ownerId: owner.id }
    : { owner: "USER" };
}

// The preset the period is, or undefined for a custom range.
function presetOf(period: FilterPeriod, today: Date): ExportPreset | undefined {
  return EXPORT_PRESETS.find((preset) => {
    const range = exportPreset(preset, today);

    return range.from === period.from && range.to === period.to;
  });
}

function toExportQuery(draft: ExportDraft, owners: OwnerDTO[]): ExportQuery {
  return {
    accountIds: draft.accountIds.length > 0 ? draft.accountIds : undefined,
    creditCardIds: draft.cardIds.length > 0 ? draft.cardIds : undefined,
    from: draft.period.from,
    to: draft.period.to,
    ...exportScope(draft.ownerSelection, owners),
  };
}

export {
  defaultExportFormat,
  exportPreset,
  exportScope,
  presetOf,
  toExportQuery,
  validatePeriod as validateExportPeriod,
};
