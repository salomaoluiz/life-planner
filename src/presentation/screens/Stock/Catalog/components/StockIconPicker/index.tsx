import { useState } from "react";

import { iconLabelFor } from "@presentation/constants/categoryIcons";
import useIsWideLayout from "@presentation/hooks/useIsWideLayout";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import IconPickerSheet from "@screens/Financial/Categories/modals/NewCategoryModal/components/IconPickerSheet";
import useIconSearch from "@screens/Financial/Categories/modals/NewCategoryModal/hooks/useIconSearch";

interface Props {
  onClose: () => void;
  onSelect: (name: string) => void;
  selected: string;
}

// Spec 125 FR 13: the icon catalog of spec 058 (FTS + trigram search), the same sheet Finance > Categories uses.
function StockIconPicker({ onClose, onSelect, selected }: Props) {
  const wide = useIsWideLayout();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const [query, setQuery] = useState("");
  const search = useIconSearch(query, true);
  const results = search.icons.map((icon) => ({
    label: iconLabelFor(icon, localeTag),
    value: icon.name,
  }));

  return (
    <IconPickerSheet
      clearLabel={t("financial.categories.iconPicker.clear")}
      closeLabel={t("common.actions.close")}
      emptyHint={t("financial.categories.iconPicker.emptyHint")}
      emptyTitle={t("financial.categories.iconPicker.empty")}
      errorHint={t("financial.categories.iconPicker.errorHint")}
      errorTitle={t("financial.categories.iconPicker.errorTitle")}
      groups={search.groups.map((entry) => ({
        icons: entry.icons.map((icon) => ({
          label: iconLabelFor(icon, localeTag),
          value: icon.name,
        })),
        title: t(`financial.categories.iconPicker.groups.${entry.group}`),
      }))}
      onClose={onClose}
      onQueryChange={setQuery}
      onRetry={search.retry}
      onSelect={(name) => {
        onSelect(name);
        onClose();
      }}
      query={query}
      resultLine={t(
        pluralKey("financial.categories.iconPicker.resultLine", results.length),
        { count: results.length, query: query.trim() },
      )}
      results={results}
      retryLabel={t("financial.categories.iconPicker.retry")}
      samples={t("financial.categories.iconPicker.samples").split(",")}
      samplesLabel={t("financial.categories.iconPicker.samplesLabel")}
      searchPlaceholder={t("common.search.placeholder")}
      selected={selected}
      status={search.status}
      title={t("stock.catalog.form.iconPick")}
      wide={wide}
    />
  );
}

export default StockIconPicker;
