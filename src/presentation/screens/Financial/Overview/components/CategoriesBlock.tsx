import { View } from "react-native";

import {
  Button,
  ChartCard,
  IconButton,
  PieBreakdown,
  SegmentedControl,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";

import { OverviewViewModel } from "../hooks/useOverviewViewModel";
import foldBars from "../models/barRows";
import blockState from "../models/blockState";
import { averagePerMonth, percentOf } from "../models/overviewFormat";
import { monthsInPeriod } from "../models/overviewPeriod";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

// Ranked categories (spec 046 FR 14): roots first, a tap on a parent opens its subcategories in place.
function CategoriesBlock(props: { vm: OverviewViewModel }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const currency = vm.currency as CurrencyCode;
  const wide = useBreakpoint() !== "compact";
  const months = monthsInPeriod(vm.period);
  function money(cents: number) {
    return formatAmount(cents, localeTag, currency);
  }
  const data = vm.categoryTotals.data;
  const items = data?.groupBy === "CATEGORY" ? data.items : [];
  const total = data?.groupBy === "CATEGORY" ? data.total : 0;
  const typeLabel = t(
    vm.type === "INCOME"
      ? "financial.overview.categories.typeIncome"
      : "financial.overview.categories.typeExpense",
  );
  // Spec 052 FR 17-19: a column on the wide layout, a second line under the name on mobile.
  function averageOf(value: number): string | undefined {
    const average = averagePerMonth(value, months);

    if (average === undefined) {
      return undefined;
    }

    return wide
      ? money(average)
      : t("financial.overview.legend.average", { value: money(average) });
  }
  const columns = {
    average: t("financial.overview.legend.averagePerMonth"),
    category: t("financial.overview.legend.category"),
    percent: t("financial.overview.legend.percent"),
    total: t("financial.overview.legend.total"),
  };
  const rows = foldBars({
    archivedSuffix: t("financial.overview.categories.archived"),
    averageOf,
    format: money,
    items: items.map((item) => ({
      archived: item.archived,
      id: item.categoryId,
      name: item.self
        ? t("financial.overview.categories.self", {
            name: vm.parent?.name ?? item.name,
          })
        : item.name,
      value: item.realized + item.projected,
    })),
    localeTag,
    otherLabel: t("financial.overview.categories.other"),
    top: vm.parent ? 50 : 8,
    total,
  });

  function onPress(id: string) {
    const item = items.find((candidate) => candidate.categoryId === id);

    if (item) {
      vm.onCategoryPress(id, item.name, item.hasChildren && !item.self, {
        percent: percentOf(item.realized + item.projected, total, localeTag),
        value: item.realized + item.projected,
      });
    }
  }

  const note = t("financial.overview.categories.cardNote");
  const footnote =
    months > 1
      ? `${note} ${t("financial.overview.legend.note", { months })}`
      : note;

  return (
    <ChartCard
      actions={
        <SegmentedControl
          accessibilityLabel={t("financial.overview.categories.title")}
          onChange={(value) => vm.onTypeChange(value as "EXPENSE" | "INCOME")}
          options={[
            {
              label: t("financial.overview.categories.typeExpense"),
              tone: "expense",
              value: "EXPENSE",
            },
            {
              label: t("financial.overview.categories.typeIncome"),
              tone: "income",
              value: "INCOME",
            },
          ]}
          testID="financial.overview.categories-type"
          value={vm.type}
        />
      }
      emptyText={t("financial.overview.empty.title")}
      errorText={t("financial.overview.blockError")}
      footnote={footnote}
      onRetry={vm.categoryTotals.refetch}
      retryLabel={t("financial.overview.retry")}
      state={vm.noTransactions ? "empty" : blockState(vm.categoryTotals)}
      subtitle={
        vm.parent ? undefined : t("financial.overview.categories.subtitle")
      }
      testID={overviewTestIds.categories}
      title={
        vm.parent ? vm.parent.name : t("financial.overview.categories.title")
      }
    >
      {vm.parent ? (
        <View style={styles.actions}>
          <IconButton
            accessibilityLabel={t("financial.overview.categories.back")}
            name="arrow-left"
            onPress={vm.onBack}
            testID={overviewTestIds.categoriesBack}
          />
          <Text.Caption
            tone="secondary"
            value={t("financial.overview.categories.header", {
              percent: vm.parent.percent,
              type: typeLabel,
              value: money(vm.parent.value),
            })}
          />
          <Button.Ghost
            inline
            label={t("financial.overview.categories.openTransactions")}
            onPress={vm.onOpenParentTransactions}
            testID={overviewTestIds.categoriesOpenTransactions}
          />
        </View>
      ) : null}
      <PieBreakdown
        columns={wide && months > 1 ? columns : undefined}
        onPress={onPress}
        openLabel={t("financial.overview.a11y.open")}
        rows={rows}
        testID="financial.overview.category"
      />
    </ChartCard>
  );
}

export default CategoriesBlock;
