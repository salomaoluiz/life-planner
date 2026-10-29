import { ChartCard, PieBreakdown } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";

import { OverviewViewModel } from "../hooks/useOverviewViewModel";
import foldBars, { UNTAGGED_ID } from "../models/barRows";
import blockState from "../models/blockState";
import { averagePerMonth } from "../models/overviewFormat";
import { monthsInPeriod } from "../models/overviewPeriod";
import overviewTestIds from "../testIds";

// Ranked tags (spec 046 FR 15): the same type as the category block; "No tag" and "Other" cannot be opened.
function TagsBlock(props: { vm: OverviewViewModel }) {
  const { vm } = props;
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const currency = vm.currency as CurrencyCode;
  const wide = useBreakpoint() !== "compact";
  const months = monthsInPeriod(vm.period);
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  const data = vm.tagTotals.data;
  const items = data?.groupBy === "TAG" ? data.items : [];
  const total = data?.groupBy === "TAG" ? data.total : 0;
  const untagged = data?.groupBy === "TAG" ? data.untagged : undefined;
  function averageOf(value: number): string | undefined {
    const average = averagePerMonth(value, months);

    if (average === undefined) {
      return undefined;
    }

    return wide
      ? money(average)
      : t("financial.overview.legend.average", { value: money(average) });
  }
  function projectedOf(value: number): string {
    return wide
      ? money(value)
      : t("financial.overview.legend.projected", { value: money(value) });
  }
  const columns = {
    average: t("financial.overview.legend.averagePerMonth"),
    category: t("financial.overview.tags.title"),
    percent: t("financial.overview.legend.percent"),
    projected: t("financial.overview.legend.projectedColumn"),
    total: t("financial.overview.legend.total"),
  };
  const note = t("financial.overview.tags.note");
  const rows = foldBars({
    averageOf,
    extra: untagged
      ? [
          {
            id: UNTAGGED_ID,
            name: t("financial.overview.tags.untagged"),
            projected: untagged.projected,
            value: untagged.realized + untagged.projected,
          },
        ]
      : [],
    format: money,
    items: items.map((item) => ({
      id: item.tagId,
      name: item.name,
      projected: item.projected,
      value: item.realized + item.projected,
    })),
    localeTag,
    otherLabel: t("financial.overview.categories.other"),
    projectedOf,
    top: 10,
    total,
  });

  return (
    <ChartCard
      emptyText={t("financial.overview.empty.title")}
      errorText={t("financial.overview.blockError")}
      footnote={
        months > 1
          ? `${note} ${t("financial.overview.legend.note", { months })}`
          : note
      }
      onRetry={vm.tagTotals.refetch}
      retryLabel={t("financial.overview.retry")}
      state={vm.noTransactions ? "empty" : blockState(vm.tagTotals)}
      testID={overviewTestIds.tags}
      title={t("financial.overview.tags.title")}
    >
      <PieBreakdown
        columns={wide && months > 1 ? columns : undefined}
        onPress={vm.onTagPress}
        openLabel={t("financial.overview.a11y.open")}
        rows={rows}
        testID="financial.overview.tag"
      />
    </ChartCard>
  );
}

export default TagsBlock;
