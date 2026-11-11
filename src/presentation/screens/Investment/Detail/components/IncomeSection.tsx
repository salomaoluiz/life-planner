import { Pressable, View } from "react-native";

import {
  Badge,
  Card,
  EmptyState,
  IconButton,
  MetricBlock,
  Section,
  SegmentedControl,
  Text,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentIncome,
} from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
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
const FILTERS = ["ALL", "PLANNED", "RECEIVED"] as const;

interface Props {
  accountNames: Map<string, string>;
  asset: InvestmentAssetDetail;
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
  const account = income.accountId
    ? (accountNames.get(income.accountId) ??
      t("investment.income.row.noAccount"))
    : t("investment.income.row.noAccount");
  const dates = t(
    planned
      ? "investment.income.row.planned"
      : "investment.income.row.received",
    { date: formatDay(income.paymentDate, localeTag) },
  );
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
      testID={ids.addButton}
      title={t("investment.income.section.title")}
    >
      <View style={{ gap: spacing.md }} testID={ids.section}>
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
          testID={ids.filter("all")}
          value={vm.filter}
        />
        {vm.items.length === 0 && !vm.isLoading ? (
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
          </Card>
        )}
      </View>
    </Section>
  );
}

export default IncomeSection;
