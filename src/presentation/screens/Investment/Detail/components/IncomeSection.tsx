import { Pressable, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  MetricBlock,
  Section,
  SegmentedControl,
  Text,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import {
  InvestmentIncomeSeriesEndReason,
  InvestmentIncomeStatus,
} from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentIncome,
  InvestmentIncomeSeries,
  InvestmentProjectedIncome,
} from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { recurrenceLabelEvery } from "@screens/Financial/utils/recurrenceLabel";
import SuggestionCard from "@screens/Investment/Income/components/SuggestionCard";
import {
  displayStatus,
  statusTone,
} from "@screens/Investment/Income/models/incomeInfo";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { IncomeSectionVM, useIncomeSectionViewModel } from "../hooks";

const ids = investmentTestIds.income;
const seriesIds = investmentTestIds.incomeSeries;
const FILTERS = ["ALL", "PLANNED", "RECEIVED"] as const;

interface Props {
  accountNames: Map<string, string>;
  asset: InvestmentAssetDetail;
}

type Translate = ReturnType<typeof useTranslation>["t"];

function accountLabel(
  income: InvestmentIncome,
  accountNames: Map<string, string>,
  t: Translate,
): string {
  if (income.accountId) {
    return (
      accountNames.get(income.accountId) ?? t("investment.income.row.noAccount")
    );
  }

  return income.withFinance
    ? t("investment.income.row.noAccount")
    : t("investment.income.series.onlyInvestments");
}

function IncomeRow({
  accountNames,
  asset,
  income,
  vm,
}: {
  accountNames: Map<string, string>;
  asset: InvestmentAssetDetail;
  income: InvestmentIncome;
  vm: IncomeSectionVM;
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const status = displayStatus(income);
  const planned = income.status === InvestmentIncomeStatus.PLANNED;
  const account = accountLabel(income, accountNames, t);
  const series = income.seriesId
    ? vm.seriesById.get(income.seriesId)
    : undefined;
  const number =
    income.occurrenceNumber === undefined
      ? ""
      : ` · ${income.occurrenceNumber}${series?.endDate ? "" : "/∞"}`;
  const dates = `${t(
    planned
      ? "investment.income.row.planned"
      : "investment.income.row.received",
    { date: formatDay(income.paymentDate, localeTag) },
  )}${number}`;
  const perUnit =
    income.amountPerUnit && income.quantity
      ? ` · ${t("investment.income.row.perUnit", {
          quantity: formatQuantity(income.quantity, localeTag),
          value: formatUnitPrice(
            income.amountPerUnit,
            asset.currency,
            localeTag,
            2,
          ),
        })}`
      : "";

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      }}
      testID={`${ids.row}-${income.id}`}
    >
      <Badge
        label={t(`investment.income.status.${status}`)}
        tone={statusTone(status)}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => vm.onEdit(income.id)}
        style={{ flex: 1, gap: spacing.xxs }}
        testID={`${ids.edit}-${income.id}`}
      >
        <Text.BodyStrong value={t(`investment.income.types.${income.type}`)} />
        <Text.Caption
          tone="secondary"
          value={`${dates}${perUnit} · ${account}`}
        />
      </Pressable>
      <View style={{ alignItems: "flex-end" }}>
        <Text.BodyStrong
          tabular
          tone={planned ? "secondary" : "income"}
          value={formatMoney(income.netAmount, asset.currency, localeTag)}
        />
        {income.estimatedWithheld > 0 ? (
          <Text.Caption
            tabular
            tone="secondary"
            value={formatMoney(
              income.estimatedGross,
              asset.currency,
              localeTag,
            )}
          />
        ) : null}
      </View>
      {planned ? (
        <IconButton
          accessibilityLabel={t("investment.income.receive.save")}
          name="check"
          onPress={() => vm.onReceive(income.id)}
          testID={`${ids.receive}-${income.id}`}
        />
      ) : null}
    </View>
  );
}

// Spec 107 section 8: pending suggestions on top, the summary tiles, the filter and the list of the asset.
function IncomeSection({ accountNames, asset }: Props) {
  const vm = useIncomeSectionViewModel(asset.id);
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const summary = vm.summary;

  return (
    <Section
      actionLabel={t("investment.income.addButton")}
      onActionPress={vm.onAdd}
      testID={ids.section}
      title={t("investment.income.section.title")}
    >
      <View style={{ gap: spacing.md }}>
        {vm.suggestions.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            <Text.BodyStrong
              value={`${t("investment.suggestions.title")} (${vm.suggestions.length})`}
            />
            {vm.suggestions.map((suggestion) => (
              <SuggestionCard
                actions={vm.suggestionActions}
                key={suggestion.id}
                suggestion={suggestion}
                today={vm.today}
              />
            ))}
            {vm.suggestionActions.failure ? (
              <Text.Caption
                tone="expense"
                value={t(
                  vm.suggestionActions.failure.key,
                  vm.suggestionActions.failure.params,
                )}
              />
            ) : null}
          </View>
        ) : null}
        {summary ? (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <MetricBlock
              label={t("investment.income.section.receivedYear")}
              testID={ids.summaryReceived}
              trend="income"
              value={formatMoney(
                summary.receivedThisYear,
                summary.currency,
                localeTag,
              )}
            />
            <MetricBlock
              label={t("investment.income.section.planned")}
              testID={ids.summaryPlanned}
              value={formatMoney(
                summary.plannedTotal,
                summary.currency,
                localeTag,
              )}
            />
          </View>
        ) : null}
        <SegmentedControl
          accessibilityLabel={t("investment.income.section.title")}
          onChange={vm.onFilterChange}
          options={FILTERS.map((key) => ({
            label: t(`investment.income.filter.${key}`),
            value: key,
          }))}
          testID={ids.filter}
          value={vm.filter}
        />
        {vm.series.map((series) => (
          <SeriesCard asset={asset} key={series.id} series={series} vm={vm} />
        ))}
        {vm.items.length === 0 && vm.projected.length === 0 && !vm.isLoading ? (
          <EmptyState
            icon="cash-plus"
            message={t("investment.income.section.empty")}
            title={t("investment.income.section.title")}
          />
        ) : (
          <Card padding="sm">
            {vm.items.map((income) => (
              <IncomeRow
                accountNames={accountNames}
                asset={asset}
                income={income}
                key={income.id}
                vm={vm}
              />
            ))}
            {vm.projected.map((item) => (
              <ProjectedRow
                asset={asset}
                item={item}
                key={`${item.seriesId}-${item.number}`}
                series={vm.seriesById.get(item.seriesId)}
              />
            ))}
          </Card>
        )}
      </View>
    </Section>
  );
}

// Spec 115: an occurrence after the current month; it exists only as a projection (dashed "Projected" chip).
function ProjectedRow({
  asset,
  item,
  series,
}: {
  asset: InvestmentAssetDetail;
  item: InvestmentProjectedIncome;
  series?: InvestmentIncomeSeries;
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
      }}
      testID={`${ids.projectedRow}-${item.seriesId}-${item.number}`}
    >
      <Badge label={t("investment.income.status.PROJECTED")} tone="neutral" />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <Text.Body
          tone="secondary"
          value={`${formatDay(item.paymentDate, localeTag)} · ${item.number}${series?.endDate ? "" : "/∞"}`}
        />
        <Text.Caption
          tone="secondary"
          value={t("investment.income.row.perUnit", {
            quantity: formatQuantity(item.quantity, localeTag),
            value: formatUnitPrice(
              series?.amountPerUnit ?? "0",
              asset.currency,
              localeTag,
              2,
            ),
          })}
        />
      </View>
      <Text.Body
        tabular
        tone="secondary"
        value={formatMoney(item.netAmount, asset.currency, localeTag)}
      />
    </View>
  );
}

// Spec 115 section 8: "Since 15/01/2025 · R$ 1,10/unit · no end date" (or its end, or only in investments).
function ruleText(
  series: InvestmentIncomeSeries,
  amount: string,
  since: string,
  localeTag: string,
  t: Translate,
): string {
  if (!series.withFinance) {
    return t("investment.income.series.cardOnlyInvestments", {
      amount,
      date: since,
    });
  }

  return series.endDate
    ? t("investment.income.series.cardWithEnd", {
        amount,
        date: since,
        end: formatDay(series.endDate, localeTag),
      })
    : t("investment.income.series.cardNoEnd", { amount, date: since });
}

// Spec 115 section 8: "Series · Monthly yield" with its rule, who edits it and, once over, why.
function SeriesCard({
  asset,
  series,
  vm,
}: {
  asset: InvestmentAssetDetail;
  series: InvestmentIncomeSeries;
  vm: IncomeSectionVM;
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const amount = formatUnitPrice(
    series.amountPerUnit,
    asset.currency,
    localeTag,
    2,
  );
  const since = formatDay(series.firstPaymentDate, localeTag);
  const rule = ruleText(series, amount, since, localeTag, t);
  const endedText = series.endedAt
    ? t(
        series.endReason === InvestmentIncomeSeriesEndReason.POSITION_ZERO
          ? "investment.income.series.endedByPosition"
          : "investment.income.series.endedManual",
        { date: formatDay(series.endedAt, localeTag) },
      )
    : undefined;

  return (
    <Card padding="sm" testID={`${ids.section}-series-${series.id}`}>
      <View style={{ gap: 4 }}>
        <Text.BodyStrong
          testID={seriesIds.card}
          value={t("investment.income.series.card", {
            frequency: recurrenceLabelEvery(t, series.frequency),
            type: t(`investment.income.types.${series.type}`),
          })}
        />
        <Text.Caption tone="secondary" value={rule} />
        {series.endedAt ? (
          <View testID={seriesIds.ended}>
            <Text.Caption
              tone="secondary"
              value={t("investment.income.series.ended", {
                date: formatDay(series.endedAt, localeTag),
              })}
            />
            {endedText ? (
              <Text.Caption tone="secondary" value={endedText} />
            ) : null}
          </View>
        ) : null}
        <Button.Secondary
          label={t("investment.income.series.edit")}
          onPress={() => vm.onEditSeries(series.id)}
          testID={`${seriesIds.edit}-${series.id}`}
        />
      </View>
    </Card>
  );
}

export default IncomeSection;
