import { ChartCard, PieBreakdown } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";

import { OverviewViewModel } from "../hooks/useOverviewViewModel";
import foldBars, { UNTAGGED_ID } from "../models/barRows";
import blockState from "../models/blockState";
import overviewTestIds from "../testIds";

// Ranked tags (spec 046 FR 15): the same type as the category block; "No tag" and "Other" cannot be opened.
function TagsBlock(props: { vm: OverviewViewModel }) {
  const { vm } = props;
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const currency = vm.currency as CurrencyCode;
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  const data = vm.tagTotals.data;
  const items = data?.groupBy === "TAG" ? data.items : [];
  const total = data?.groupBy === "TAG" ? data.total : 0;
  const untagged = data?.groupBy === "TAG" ? data.untagged : undefined;
  const rows = foldBars({
    extra: untagged
      ? [
          {
            id: UNTAGGED_ID,
            name: t("financial.overview.tags.untagged"),
            value: untagged.realized + untagged.projected,
          },
        ]
      : [],
    format: money,
    items: items.map((item) => ({
      id: item.tagId,
      name: item.name,
      value: item.realized + item.projected,
    })),
    localeTag,
    otherLabel: t("financial.overview.categories.other"),
    top: 10,
    total,
  });

  return (
    <ChartCard
      emptyText={t("financial.overview.empty.title")}
      errorText={t("financial.overview.blockError")}
      footnote={t("financial.overview.tags.note")}
      onRetry={vm.tagTotals.refetch}
      retryLabel={t("financial.overview.retry")}
      state={vm.noTransactions ? "empty" : blockState(vm.tagTotals)}
      testID={overviewTestIds.tags}
      title={t("financial.overview.tags.title")}
    >
      <PieBreakdown
        onPress={vm.onTagPress}
        openLabel={t("financial.overview.a11y.open")}
        rows={rows}
        testID="financial.overview.tag"
      />
    </ChartCard>
  );
}

export default TagsBlock;
