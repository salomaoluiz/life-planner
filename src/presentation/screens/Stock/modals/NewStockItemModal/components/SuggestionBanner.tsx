import { StatusBanner } from "@components";
import { useTranslation } from "@presentation/i18n";

import { NewStockItemVM } from "../hooks";
import stockItemFormTestIds from "../testIds";

interface Props {
  vm: NewStockItemVM;
}

// What the suggestions did (spec 121 FR 15, 19, 22): searching, filled, not sure, unavailable or limit reached.
function SuggestionBanner({ vm }: Props) {
  const { t } = useTranslation();
  const { banner, usage } = vm.ai;

  if (!banner) {
    return null;
  }

  const message = {
    limit: t("stock.suggestions.limitReached", {
      limit: usage?.search.limit ?? 0,
      used: usage?.search.used ?? 0,
    }),
    notSure: t("stock.suggestions.notSure"),
    searching: t("stock.suggestions.searching"),
    suggestions: t("stock.suggestions.banner"),
    unavailable: t("stock.suggestions.unavailable"),
  }[banner];
  const info = banner === "searching" || banner === "suggestions";

  return (
    <StatusBanner
      actionLabel={
        banner === "searching" ? t("stock.suggestions.fillMyself") : undefined
      }
      icon={info ? "auto-fix" : "alert-circle-outline"}
      message={message}
      onAction={banner === "searching" ? vm.ai.onSkip : undefined}
      testID={stockItemFormTestIds.suggestionBanner}
      tone={info ? "info" : "warning"}
    />
  );
}

export default SuggestionBanner;
