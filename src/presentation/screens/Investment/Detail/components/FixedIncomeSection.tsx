import { StyleSheet, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  MetricBlock,
  Section,
  SegmentedControl,
  StatusBanner,
  Text,
  useDensity,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentFixedIncome,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import {
  fractionToPercent,
  latestRate,
  lotTaxesKey,
  percentText,
  rateEntry,
  rateSummary,
} from "@screens/Investment/FixedIncome/models/fixedIncome";
import {
  formatDay,
  formatMoney,
  formatPercent,
  formatResult,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { InvestmentDetailVM } from "../hooks";
import { FIXED_INCOME_TABS } from "../models/fixedIncomeTab";

const ids = investmentTestIds.detail.fixedIncome;

// The header actions of a calculated title (spec 105 FR 30, 33): four on a wide screen, "Redeem" + "More actions" on mobile.
export function FixedIncomeActions({ vm }: { vm: InvestmentDetailVM }) {
  const { t } = useTranslation();
  const compact = useDensity().density === "compact";

  if (vm.archived) {
    return null;
  }

  if (compact) {
    return (
      <>
        <Button.Primary
          label={t("investment.fixedIncome.action.redeem")}
          onPress={vm.onRedeem}
          testID={ids.actionRedeem}
        />
        <Button.Secondary
          label={t("investment.fixedIncome.action.more")}
          onPress={vm.onFixedIncomeMore}
          testID={ids.more}
        />
      </>
    );
  }

  return (
    <>
      <Button.Secondary
        label={t("investment.fixedIncome.action.adjust")}
        onPress={vm.onAdjust}
        testID={ids.actionAdjust}
      />
      <Button.Secondary
        label={t("investment.fixedIncome.action.updateRate")}
        onPress={vm.onUpdateRate}
        testID={ids.actionRates}
      />
      <Button.Secondary
        label={t("investment.fixedIncome.action.contribute")}
        onPress={vm.onContribute}
        testID={ids.actionContribute}
      />
      <Button.Primary
        label={t("investment.fixedIncome.action.redeem")}
        onPress={vm.onRedeem}
        testID={ids.actionRedeem}
      />
    </>
  );
}

export function FixedIncomeChips({
  fixedIncome,
}: {
  fixedIncome: InvestmentFixedIncome;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Badge
        label={t(`investment.fixedIncome.product.${fixedIncome.product}`)}
      />
      <Badge
        label={t(
          fixedIncome.taxExempt
            ? "investment.fixedIncome.exempt"
            : "investment.fixedIncome.taxed",
        )}
      />
    </>
  );
}

function AtMaturity({ fixedIncome }: { fixedIncome: InvestmentFixedIncome }) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const styles = useRow();
  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }

  return (
    <Card testID={ids.atMaturity}>
      <View style={styles.gap}>
        <Text.BodyStrong
          value={t("investment.fixedIncome.atMaturityOn", {
            date: formatDay(fixedIncome.maturityDate, localeTag),
          })}
        />
        <View style={styles.line}>
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.projectedGross")}
          />
          <Text.Body tabular value={money(fixedIncome.atMaturity.gross)} />
        </View>
        <View style={styles.line}>
          <Text.Caption
            tone="secondary"
            value={t("investment.fixedIncome.irEstimated")}
          />
          <Text.Body
            tabular
            tone="expense"
            value={`− ${money(fixedIncome.atMaturity.ir)}`}
          />
        </View>
        <View style={styles.line}>
          <Text.BodyStrong value={t("investment.fixedIncome.projectedNet")} />
          <Text.BodyStrong tabular value={money(fixedIncome.atMaturity.net)} />
        </View>
        <Text.Caption
          tone="secondary"
          value={t("investment.fixedIncome.projectedHint")}
        />
      </View>
    </Card>
  );
}

function Cards({ fixedIncome }: { fixedIncome: InvestmentFixedIncome }) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const { spacing } = useKitTheme();
  const styles = useRow();
  const applied = fixedIncome.lots.reduce(
    (sum, lot) => sum + lot.remainingPrincipal,
    0,
  );
  const result = fixedIncome.today.gross - applied;
  const percent = applied > 0 ? result / applied : 0;
  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }
  const wrap = { flexBasis: compact ? "47%" : "15%", flexGrow: 1 } as const;

  function card(
    label: string,
    value: string,
    testID: string,
    extra?: string,
    tone: "expense" | "income" | "primary" | "secondary" = "primary",
  ) {
    return (
      <View style={wrap}>
        <MetricBlock
          label={label}
          value={
            <View style={{ gap: spacing.xxs }}>
              <Text.Heading tabular testID={testID} tone={tone} value={value} />
              {extra ? (
                <Text.Caption
                  tone={tone === "primary" ? "secondary" : tone}
                  value={extra}
                />
              ) : null}
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.cards}>
      {card(
        t("investment.fixedIncome.applied"),
        money(applied),
        ids.cardApplied,
        t(
          pluralKey(
            "investment.fixedIncome.appliedLots",
            fixedIncome.lots.length,
          ),
          {
            count: fixedIncome.lots.length,
          },
        ),
      )}
      {card(
        t("investment.fixedIncome.grossToday"),
        money(fixedIncome.today.gross),
        ids.cardGross,
        t("investment.fixedIncome.grossResult", {
          percent: formatPercent(percent, localeTag),
          result: formatResult(result, "BRL", localeTag),
        }),
      )}
      {card(
        t("investment.fixedIncome.irEstimated"),
        `− ${money(fixedIncome.today.ir)}`,
        ids.cardIr,
        t("investment.fixedIncome.irHint"),
        "expense",
      )}
      {card(
        t("investment.fixedIncome.iofEstimated"),
        `− ${money(fixedIncome.today.iof)}`,
        ids.cardIof,
        t("investment.fixedIncome.iofHint"),
        "expense",
      )}
      {card(
        t("investment.fixedIncome.netEstimated"),
        money(fixedIncome.today.net),
        ids.cardNet,
        t("investment.fixedIncome.netResult", {
          result: formatResult(
            fixedIncome.today.net - applied,
            "BRL",
            localeTag,
          ),
        }),
        "income",
      )}
    </View>
  );
}

function FixedIncomeSection({
  asset,
  fixedIncome,
  vm,
}: {
  asset: InvestmentAssetDetail;
  fixedIncome: InvestmentFixedIncome;
  vm: InvestmentDetailVM;
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const styles = useRow();

  return (
    <View style={styles.gap}>
      <RateLine fixedIncome={fixedIncome} />
      {fixedIncome.maturityPending ? (
        <StatusBanner
          actionLabel={
            vm.readOnly ? undefined : t("investment.fixedIncome.pending.action")
          }
          icon="calendar-alert"
          message={`${t("investment.fixedIncome.pending.title", {
            date: formatDay(fixedIncome.maturityDate, localeTag),
          })}. ${t("investment.fixedIncome.pending.body", {
            net: formatMoney(fixedIncome.atMaturity.net, "BRL", localeTag),
          })}`}
          onAction={vm.onConfirmMaturity}
          testID={ids.pendingBanner}
        />
      ) : null}
      <Cards fixedIncome={fixedIncome} />
      <View style={styles.sections}>
        <Section title={t("investment.detail.operations")}>
          <SegmentedControl
            accessibilityLabel={t("investment.fixedIncome.tab.lots")}
            onChange={vm.onFixedIncomeTabChange}
            options={FIXED_INCOME_TABS.map((tab) => ({
              label: t(`investment.fixedIncome.tab.${tab}`),
              value: tab,
            }))}
            testID={ids.tabs}
            value={vm.fixedIncomeTab}
          />
          {vm.fixedIncomeTab === "lots" ? (
            <Lots fixedIncome={fixedIncome} />
          ) : null}
          {vm.fixedIncomeTab === "rates" ? (
            <Rates fixedIncome={fixedIncome} vm={vm} />
          ) : null}
          {vm.fixedIncomeTab === "operations" ? (
            <Operations asset={asset} vm={vm} />
          ) : null}
        </Section>
        <AtMaturity fixedIncome={fixedIncome} />
      </View>
    </View>
  );
}

function LotRow({
  fixedIncome,
  lot,
}: {
  fixedIncome: InvestmentFixedIncome;
  lot: InvestmentFixedIncome["lots"][number];
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const compact = useDensity().density === "compact";
  const styles = useRow();
  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }
  const taxes = t(lotTaxesKey(fixedIncome.taxExempt, lot.iofRate), {
    days: lot.days,
    iof: fractionToPercent(lot.iofRate, localeTag),
    ir: fractionToPercent(lot.irRate, localeTag),
  });

  return (
    <View style={styles.row} testID={`${ids.lotRow}-${lot.operationId}`}>
      <View style={styles.cell}>
        <Text.Body value={formatDay(lot.date, localeTag)} />
        <Text.Caption
          tabular
          tone="secondary"
          value={`${money(lot.remainingPrincipal)} · ${taxes}`}
        />
      </View>
      {compact ? null : (
        <>
          <View style={styles.cellRight}>
            <Text.Caption
              tone="secondary"
              value={t("investment.fixedIncome.lotColumns.gross")}
            />
            <Text.Body tabular value={money(lot.gross)} />
          </View>
          <View style={styles.cellRight}>
            <Text.Caption
              tone="secondary"
              value={t("investment.fixedIncome.lotColumns.iof")}
            />
            <Text.Body tabular value={lot.iof > 0 ? money(lot.iof) : "—"} />
          </View>
          <View style={styles.cellRight}>
            <Text.Caption
              tone="secondary"
              value={t("investment.fixedIncome.lotColumns.ir")}
            />
            <Text.Body tabular value={money(lot.ir)} />
          </View>
        </>
      )}
      <View style={styles.cellRight}>
        <Text.BodyStrong tabular value={money(lot.net)} />
      </View>
    </View>
  );
}

function Lots({ fixedIncome }: { fixedIncome: InvestmentFixedIncome }) {
  const { t } = useTranslation();
  const styles = useRow();

  return (
    <View style={styles.stack}>
      {fixedIncome.lots.length === 0 ? (
        <EmptyState
          icon="check-circle-outline"
          message={t("investment.fixedIncome.lotsHint")}
          title={t("investment.fixedIncome.lotsEmpty")}
        />
      ) : (
        <Card padding="sm">
          {fixedIncome.lots.map((lot) => (
            <LotRow fixedIncome={fixedIncome} key={lot.operationId} lot={lot} />
          ))}
        </Card>
      )}
      <Text.Caption
        tone="secondary"
        value={t("investment.fixedIncome.lotsFootnote")}
      />
    </View>
  );
}

// Contributions and redemptions of the title; the IR/IOF withheld show as the fees of a redemption.
function OperationLine({
  operation,
  vm,
}: {
  operation: InvestmentOperation;
  vm: InvestmentDetailVM;
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const styles = useRow();
  const sell = operation.type === InvestmentOperationType.SELL;
  function money(cents: number) {
    return formatMoney(cents, "BRL", localeTag);
  }
  const withheld = operation.fees
    .map((fee) => `${t(`investment.fee.${fee.kind}`)} ${money(fee.amount)}`)
    .join(" · ");

  return (
    <View style={styles.row} testID={`${ids.tabOperations}-${operation.id}`}>
      <View style={styles.cell}>
        <Text.BodyStrong
          tone={sell ? "warning" : "accent"}
          value={t(`investment.operation.${operation.type}`)}
        />
        <Text.Caption
          tone="secondary"
          value={formatDay(operation.date, localeTag)}
        />
      </View>
      <View style={styles.cellRight}>
        <Text.BodyStrong tabular value={money(operation.total)} />
        {withheld ? <Text.Caption tone="secondary" value={withheld} /> : null}
      </View>
      {vm.readOnly || vm.archived ? null : (
        <IconButton
          accessibilityLabel={t("investment.form.operation.deleteTitle")}
          name="delete-outline"
          onPress={() => vm.onFixedIncomeOperationDelete(operation.id)}
          testID={`${ids.operationDelete}-${operation.id}`}
        />
      )}
    </View>
  );
}

function Operations({
  asset,
  vm,
}: {
  asset: InvestmentAssetDetail;
  vm: InvestmentDetailVM;
}) {
  const { t } = useTranslation();

  if (asset.operations.length === 0) {
    return (
      <EmptyState
        icon="swap-horizontal"
        message={t("investment.detail.operationsEmpty")}
        title={t("investment.detail.operations")}
      />
    );
  }

  return (
    <Card padding="sm">
      {asset.operations.map((operation) => (
        <OperationLine key={operation.id} operation={operation} vm={vm} />
      ))}
    </Card>
  );
}

// "110% do CDI (CDI 14,90%) = 16,51% a.a. · Vence em ... · Liquidez ..." (artboard "detalhe").
function RateLine({ fixedIncome }: { fixedIncome: InvestmentFixedIncome }) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const current = latestRate({
    ...fixedIncome,
    rates: fixedIncome.rates.filter(
      (rate) => rate.startDate <= new Date().toISOString().slice(0, 10),
    ),
  });
  const rate = current ?? latestRate(fixedIncome);

  if (!rate) {
    return null;
  }

  const summary = rateSummary(rate, localeTag);

  return (
    <Text.Body
      testID={ids.rateLine}
      tone="secondary"
      value={t("investment.fixedIncome.rateLine", {
        date: formatDay(fixedIncome.maturityDate, localeTag),
        effective: percentText(fixedIncome.currentEffectiveRate, localeTag),
        liquidity: t(
          `investment.fixedIncome.liquidity.${fixedIncome.liquidity}`,
        ),
        rate: t(summary.key, summary.params),
      })}
    />
  );
}

function Rates({
  fixedIncome,
  vm,
}: {
  fixedIncome: InvestmentFixedIncome;
  vm: InvestmentDetailVM;
}) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const styles = useRow();
  const rates = [...fixedIncome.rates].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <Card padding="sm">
      {rates.map((rate) => {
        const entry = rateEntry(rate, localeTag);

        return (
          <View
            key={rate.id}
            style={styles.row}
            testID={`${ids.rateRow}-${rate.id}`}
          >
            <View style={styles.cell}>
              <Text.Body
                value={t("investment.fixedIncome.rateSince", {
                  date: formatDay(rate.startDate, localeTag),
                })}
              />
              <Text.Caption
                tabular
                tone="secondary"
                value={t(entry.key, entry.params)}
              />
            </View>
            {vm.readOnly || vm.archived ? null : (
              <>
                <IconButton
                  accessibilityLabel={t("investment.fixedIncome.rateEdit")}
                  name="pencil-outline"
                  onPress={() => vm.onRateEdit(rate.id)}
                  testID={`${ids.rateEdit}-${rate.id}`}
                />
                {rates.length > 1 ? (
                  <IconButton
                    accessibilityLabel={t("investment.fixedIncome.rateDelete")}
                    name="delete-outline"
                    onPress={() => vm.onRateDelete(rate.id)}
                    testID={`${ids.rateDelete}-${rate.id}`}
                  />
                ) : null}
              </>
            )}
          </View>
        );
      })}
    </Card>
  );
}

function useRow() {
  const { spacing } = useKitTheme();

  return StyleSheet.create({
    cards: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    cell: { flex: 1, minWidth: 0 },
    cellRight: { alignItems: "flex-end", flex: 1 },
    gap: { gap: spacing.md },
    line: { flexDirection: "row", justifyContent: "space-between" },
    row: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    sections: { flexDirection: "column", gap: spacing.md },
    stack: { gap: spacing.xs },
  });
}

export default FixedIncomeSection;
