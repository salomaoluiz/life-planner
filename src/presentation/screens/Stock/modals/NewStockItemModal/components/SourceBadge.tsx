import { Badge } from "@components";
import { useTranslation } from "@presentation/i18n";

import { NewStockItemVM } from "../hooks";

interface Props {
  field: keyof NewStockItemVM["ai"]["sources"];
  vm: NewStockItemVM;
}

// "Open Food Facts" / "IA" next to a field the suggestions filled; it goes away when the user edits it (FR 15).
function SourceBadge({ field, vm }: Props) {
  const { t } = useTranslation();
  const source = vm.ai.sources[field];

  if (!source) {
    return null;
  }

  return (
    <Badge
      label={t(
        source === "AI" ? "stock.source.ai" : "stock.source.openFoodFacts",
      )}
      tone={source === "AI" ? "accent" : "warning"}
    />
  );
}

export default SourceBadge;
