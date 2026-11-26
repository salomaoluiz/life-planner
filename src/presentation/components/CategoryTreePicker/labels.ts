import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";

export interface TreePickerLabels {
  apply: (count: number) => string;
  clear: string;
  close: string;
  createNamed: (name: string) => string;
  empty: string;
  emptyHint: string;
  includedIn: (name: string) => string;
  more: string;
  newLabel: string;
  noneLabel?: string;
  results: (count: number) => string;
  searchPlaceholder: string;
}

type Kind = "category" | "location";

// The shared copy of every tree picker (spec 126 section 8); `none` picks the first "no value" row.
function useTreePickerLabels(
  kind: Kind,
  none?: "category" | "financePosting" | "location",
): TreePickerLabels {
  const { t } = useTranslation();
  const location = kind === "location";
  const noneKeys = {
    category: "common.treePicker.noCategory",
    financePosting: "common.treePicker.noFinancePosting",
    location: "common.treePicker.noLocation",
  } as const;

  return {
    apply: (count) => t("common.treePicker.apply", { count }),
    clear: t("common.treePicker.clear"),
    close: t("common.actions.close"),
    createNamed: (name) => t("common.treePicker.createNamed", { name }),
    empty: t(
      location
        ? "common.treePicker.emptyLocation"
        : "common.treePicker.emptyCategory",
    ),
    emptyHint: t("common.treePicker.emptyHint"),
    includedIn: (name) => t("common.treePicker.includedIn", { name }),
    more: t("common.treePicker.more"),
    newLabel: t(
      location
        ? "common.treePicker.newLocation"
        : "common.treePicker.newCategory",
    ),
    noneLabel: none ? t(noneKeys[none]) : undefined,
    results: (count) =>
      t(pluralKey("common.treePicker.results", count), { count }),
    searchPlaceholder: t(
      location
        ? "common.treePicker.searchLocation"
        : "common.treePicker.searchCategory",
    ),
  };
}

export default useTreePickerLabels;
