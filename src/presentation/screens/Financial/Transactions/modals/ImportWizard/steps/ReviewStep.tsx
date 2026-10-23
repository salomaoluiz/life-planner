import { View } from "react-native";

import {
  AmountText,
  Badge,
  Button,
  Card,
  Checkbox,
  ChipGroup,
  Divider,
  FormColumns,
  Text,
  TruncatedText,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import {
  CurrencyTotal,
  ReviewBlockKey,
} from "@screens/Financial/Transactions/models/importReview";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "../styles";
import { ImportWizardState } from "../useImportWizardViewModel";
import useReviewStepViewModel, {
  ReviewBlockView,
  ReviewGroupView,
  ReviewRowView,
} from "./useReviewStepViewModel";

const ids = transactionsTestIds;

// Step 4 of the import wizard (spec 047 FR 27-32, spec 049): the rows in an Account and a Card block, grouped by
// account/card with income and expense subtotals, and the manual Refresh of the dry run.
function ReviewStep(props: { wizard: ImportWizardState }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const vm = useReviewStepViewModel(props.wizard);
  const { wide } = vm;

  // `2026-08` → `08/26`, cents → the amount of the row's currency (spec 048).
  function errorParams(row: ReviewRowView) {
    const { due, month, value } = row.errorParams ?? {};
    const currency = row.amount?.currency as "BRL" | undefined;

    return {
      due:
        typeof due === "number" && currency
          ? formatAmount(due, localeTag, currency)
          : due,
      month:
        typeof month === "string"
          ? `${month.slice(5, 7)}/${month.slice(2, 4)}`
          : (row.invoice ?? ""),
      value:
        typeof value === "number" && currency
          ? formatAmount(value, localeTag, currency)
          : value,
    };
  }

  function details(row: ReviewRowView) {
    return [
      `${t("financial.import.review.columns.line")} ${row.line}`,
      row.date,
      row.creditKey
        ? t(`financial.import.values.creditNames.${row.creditKey}`)
        : row.category,
      row.source,
      row.isPayment &&
        (row.paidFrom
          ? t("financial.import.review.paidFrom", { account: row.paidFrom })
          : t("financial.import.review.boleto")),
      row.invoice &&
        t("financial.import.review.invoice", { month: row.invoice }),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function rowView(row: ReviewRowView) {
    return (
      <View key={row.line} testID={`${ids.importRow}.${row.line}`}>
        <View style={styles.tableRow}>
          <View style={styles.grow}>
            <Checkbox
              checked={row.checked}
              disabled={row.locked}
              label={row.description}
              onChange={() => vm.onRowToggle(row.line, !row.checked)}
              testID={`${ids.importRow}.${row.line}.check`}
            />
            <TruncatedText
              tone={"secondary"}
              value={details(row)}
              variant={"caption"}
            />
            {row.duplicate ? (
              <Badge
                label={t("financial.import.review.duplicateBadge")}
                testID={`${ids.importRow}.${row.line}.duplicate`}
                tone={"warning"}
              />
            ) : null}
            {row.errorCode ? (
              <Badge
                label={t(
                  `financial.import.errors.${row.errorCode}`,
                  errorParams(row),
                )}
                testID={`${ids.importRow}.${row.line}.error`}
                tone={"expense"}
              />
            ) : null}
          </View>
          {row.amount && !row.errorCode?.startsWith("INVALID_VALUE") ? (
            <AmountText
              currency={row.amount.currency as "BRL"}
              type={row.amount.type}
              value={row.amount.cents}
            />
          ) : (
            <Text.Caption tone={"secondary"} value={row.amountText} />
          )}
        </View>
        <Divider />
      </View>
    );
  }

  function meta(selected: number, total: number) {
    const unchecked = total - selected;

    return [
      t("financial.import.review.groups.selectedOf", { selected, total }),
      unchecked > 0
        ? t("financial.import.review.groups.unchecked", { count: unchecked })
        : undefined,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function amountOf(totals: CurrencyTotal[], currency: CurrencyCode) {
    return totals.find((total) => total.currency === currency)?.cents ?? 0;
  }

  function currenciesOf(income: CurrencyTotal[], expenses: CurrencyTotal[]) {
    const codes = [
      ...new Set([...income, ...expenses].map((total) => total.currency)),
    ].sort((a, b) => {
      if (a === b) {
        return 0;
      }

      if (a === DEFAULT_CURRENCY) {
        return -1;
      }

      return b === DEFAULT_CURRENCY ? 1 : a.localeCompare(b);
    });

    return codes.length > 0 ? codes : [DEFAULT_CURRENCY];
  }

  function totalsLabel(
    income: CurrencyTotal[],
    expenses: CurrencyTotal[],
    currencies: CurrencyCode[],
  ) {
    function list(totals: CurrencyTotal[], type: "EXPENSE" | "INCOME") {
      return currencies
        .map((currency) =>
          formatAmount(amountOf(totals, currency), localeTag, currency, type),
        )
        .join(" · ");
    }

    return `${t("financial.import.review.groups.income")} ${list(income, "INCOME")}, ${t(
      "financial.import.review.groups.expenses",
    )} ${list(expenses, "EXPENSE")}`;
  }

  // Spec 049 FR 8-9: both totals always shown, one pair per currency, never converted.
  function totals(
    income: CurrencyTotal[],
    expenses: CurrencyTotal[],
    prefix: string,
    withLabels: boolean,
  ) {
    const currencies = currenciesOf(income, expenses);

    return (
      <View
        accessibilityLabel={totalsLabel(income, expenses, currencies)}
        style={[styles.totals, !wide && styles.totalsStack]}
      >
        <View style={styles.totalsColumn} testID={`${prefix}.income`}>
          {withLabels ? (
            <Text.Caption
              tone={"secondary"}
              value={t("financial.import.review.groups.income")}
            />
          ) : null}
          {currencies.map((currency) => (
            <AmountText
              currency={currency}
              key={currency}
              size={"caption"}
              type={"INCOME"}
              value={amountOf(income, currency)}
            />
          ))}
        </View>
        <View style={styles.totalsColumn} testID={`${prefix}.expenses`}>
          {withLabels ? (
            <Text.Caption
              tone={"secondary"}
              value={t("financial.import.review.groups.expenses")}
            />
          ) : null}
          {currencies.map((currency) => (
            <AmountText
              currency={currency}
              key={currency}
              size={"caption"}
              type={"EXPENSE"}
              value={amountOf(expenses, currency)}
            />
          ))}
        </View>
      </View>
    );
  }

  function groupView(
    block: ReviewBlockKey,
    group: ReviewGroupView,
    index: number,
  ) {
    // FR 11: only groups with a row on the current page get a heading.
    if (!group.emptyInFilter && group.rows.length === 0) {
      return null;
    }

    const prefix = `${ids.importGroup}.${block}.${index}`;

    return (
      <View key={group.key} testID={prefix}>
        <View style={[styles.groupHeader, !wide && styles.groupStack]}>
          <View style={styles.heading}>
            <Text.BodyStrong
              accessibilityRole={"header"}
              value={group.nameKey ? t(group.nameKey) : (group.name ?? "")}
            />
            <Text.Caption value={meta(group.selected, group.total)} />
          </View>
          {totals(group.income, group.expenses, prefix, false)}
        </View>
        {group.emptyInFilter && group.rows.length === 0 ? (
          <Text.Caption
            tone={"secondary"}
            value={t("financial.import.review.groups.noRowsInFilter")}
          />
        ) : null}
        {group.rows.map(rowView)}
      </View>
    );
  }

  function blockView(block: ReviewBlockView) {
    return (
      <View key={block.block} testID={`${ids.importGroup}.${block.block}`}>
        <Card padding={"sm"}>
          <View style={[styles.blockHeaderRow, !wide && styles.blockStack]}>
            <View style={styles.heading}>
              <Text.Overline
                accessibilityRole={"header"}
                value={t(
                  block.block === "account"
                    ? "financial.import.review.groups.account"
                    : "financial.import.review.groups.card",
                )}
              />
              <Text.Caption value={meta(block.selected, block.total)} />
            </View>
            {totals(
              block.income,
              block.expenses,
              `${ids.importGroup}.${block.block}`,
              wide,
            )}
          </View>
          {block.total === 0 ? (
            <Text.Caption
              tone={"secondary"}
              value={t("financial.import.review.groups.noRows")}
            />
          ) : null}
        </Card>
        {block.groups.map((group, index) =>
          groupView(block.block, group, index),
        )}
      </View>
    );
  }

  function left() {
    if (vm.validating) {
      return (
        <Text.Body
          tone={"secondary"}
          value={t("financial.import.review.validating")}
        />
      );
    }

    if (vm.validateFailed) {
      return (
        <View accessibilityRole={"alert"}>
          <Text.Body
            tone={"expense"}
            value={t("financial.import.review.validateFailed")}
          />
        </View>
      );
    }

    return (
      <View style={styles.stack}>
        <ChipGroup
          layout={"wrap"}
          mode={"single"}
          onChange={vm.onFilterChange}
          options={[
            {
              label: t("financial.import.review.filter.all", {
                count: vm.total,
              }),
              value: "ALL",
            },
            {
              label: t("financial.import.review.filter.errors", {
                count: vm.summary.errors,
              }),
              value: "ERRORS",
            },
            {
              label: t("financial.import.review.filter.duplicates", {
                count: vm.summary.duplicates,
              }),
              value: "DUPLICATES",
            },
          ]}
          testID={ids.importFilter}
          value={vm.filter}
        />
        <Text.Caption
          tone={"secondary"}
          value={t("financial.import.review.groups.subtotalsNote")}
        />
        {vm.filteredCount === 0 ? (
          <Text.Caption
            tone={"secondary"}
            value={t("financial.import.review.noMatch")}
          />
        ) : (
          <>
            {vm.blocks.map(blockView)}
            {vm.hasMore ? (
              <Button.Secondary
                label={t("financial.import.review.showMore", {
                  count: vm.remaining,
                })}
                onPress={vm.onShowMore}
                testID={ids.importShowMore}
              />
            ) : null}
          </>
        )}
      </View>
    );
  }

  function statLine(
    label: string,
    value: number,
    testID: string,
    tone?: "expense",
  ) {
    return (
      <View style={styles.tableRow} testID={testID}>
        <View style={styles.grow}>
          <Text.Body tone={tone} value={label} />
        </View>
        <Text.BodyStrong tabular tone={tone} value={String(value)} />
      </View>
    );
  }

  function right() {
    return (
      <View style={styles.stack}>
        <Text.BodyStrong value={t("financial.import.review.summary.title")} />
        <View testID={ids.importSummary}>
          {statLine(
            t("financial.import.review.summary.ready"),
            vm.summary.ready,
            `${ids.importSummary}.ready`,
          )}
          {statLine(
            t("financial.import.review.summary.duplicates"),
            vm.summary.duplicates,
            `${ids.importSummary}.duplicates`,
          )}
          {statLine(
            t("financial.import.review.summary.errors"),
            vm.summary.errors,
            `${ids.importSummary}.errors`,
            vm.summary.errors > 0 ? "expense" : undefined,
          )}
          {statLine(
            t("financial.import.review.summary.created"),
            vm.created,
            `${ids.importSummary}.created`,
          )}
          {statLine(
            t("financial.import.review.summary.system"),
            vm.ignoredSystemRows,
            `${ids.importSummary}.system`,
          )}
        </View>
        <View testID={`${ids.importSummary}.kinds`}>
          <Text.Body
            testID={`${ids.importSummary}.credits`}
            value={t("financial.import.review.summary.credits", {
              count: vm.kinds.credits,
            })}
          />
          <Text.Body
            testID={`${ids.importSummary}.payments`}
            value={t("financial.import.review.summary.payments", {
              count: vm.kinds.payments,
            })}
          />
        </View>
        {vm.invoices.length > 0 ? (
          <View>
            <Text.BodyStrong
              value={t("financial.import.review.summary.invoicesTitle")}
            />
            {vm.invoices.map((invoice) => (
              <Text.Caption
                key={invoice.id}
                testID={`${ids.importSummary}.invoice.${invoice.id}`}
                tone={invoice.paid ? "income" : "secondary"}
                value={t(
                  invoice.paid
                    ? "financial.import.review.summary.invoicePaid"
                    : "financial.import.review.summary.invoicePending",
                  {
                    card: invoice.card,
                    month: invoice.month,
                    value: formatAmount(invoice.cents, localeTag, "BRL"),
                  },
                )}
              />
            ))}
            {vm.stale ? (
              <Text.Caption
                testID={`${ids.importSummary}.invoices-stale`}
                tone={"secondary"}
                value={t("financial.import.review.summary.invoicesStale")}
              />
            ) : null}
          </View>
        ) : null}
        {vm.stale && wide ? (
          <View accessibilityRole={"alert"} testID={ids.importStale}>
            <Text.Caption
              tone={"warning"}
              value={t("financial.import.review.refresh.stale")}
            />
          </View>
        ) : null}
        {vm.refreshFailed ? (
          <View accessibilityRole={"alert"}>
            <Text.Caption
              tone={"expense"}
              value={t("financial.import.review.refresh.failed")}
            />
          </View>
        ) : null}
        {wide ? (
          <Button.Secondary
            disabled={!vm.canRefresh}
            fullWidth
            icon={vm.refreshing ? undefined : "refresh"}
            label={t(
              vm.refreshing
                ? "financial.import.review.refresh.refreshing"
                : "financial.import.review.refresh.action",
            )}
            loading={vm.refreshing}
            onPress={vm.onRefresh}
            testID={ids.importRefresh}
          />
        ) : null}
        {vm.summary.duplicates > 0 ? (
          <Text.Caption
            tone={"warning"}
            value={t(
              pluralKey(
                "financial.import.review.duplicatesWarning",
                vm.summary.duplicates,
              ),
              { count: vm.summary.duplicates },
            )}
          />
        ) : null}
        {vm.summary.errors > 0 ? (
          <Text.Caption
            tone={"expense"}
            value={t(
              pluralKey(
                "financial.import.review.errorsWarning",
                vm.summary.errors,
              ),
              { count: vm.summary.errors },
            )}
          />
        ) : null}
      </View>
    );
  }

  return (
    <FormColumns
      left={left()}
      leftFlex={5}
      leftPaneTestID={ids.importLeftPane}
      right={right()}
      rightFlex={2}
      rightPaneTestID={ids.importRightPane}
      testID={ids.importStep}
    />
  );
}

export default ReviewStep;
