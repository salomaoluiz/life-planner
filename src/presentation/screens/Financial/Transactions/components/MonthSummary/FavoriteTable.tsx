import { StyleSheet, View } from "react-native";

import { AmountText, Divider, Highlight, Icon, Text } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { useKitTheme } from "@components/utils/useKitTheme";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useLocaleTag } from "@presentation/i18n";
import UpdatingTotal from "@screens/Financial/Transactions/components/UpdatingTotal";
import { MonthSummaryValues } from "@screens/Financial/Transactions/models/favoriteMonthSummary";

interface Props {
  columns: SummaryTableColumn[];
  labels: SummaryTableLabels;
  // Spec 094.2 FR 12: one accessible element per row, "label: favorite value, total value".
  rowA11yLabel: (label: string, values: string[]) => string;
  testID?: string;
  updating?: boolean;
}

type RowKind = "detail" | "pending" | "result";

interface RowSpec {
  key: keyof MonthSummaryValues;
  kind: RowKind;
  label: string;
  tone: "expense" | "income" | "result";
}

interface SummaryTableColumn {
  emphasis: "muted" | "primary";
  key: string;
  label: string;
  values: MonthSummaryValues;
}

interface SummaryTableLabels {
  expenses: string;
  income: string;
  projected: string;
  result: string;
  toPay: string;
  toReceive: string;
}

// Spec 094.2 FR 7: the month summary as a table, one column per figure source (the favorite, the total of the filter).
function FavoriteTable(props: Props) {
  const { colors, spacing } = useKitTheme();
  const { labels } = props;
  const localeTag = useLocaleTag();
  const styles = StyleSheet.create({
    cell: {
      alignItems: "flex-end",
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    header: { alignItems: "center", flexDirection: "row" },
    headerName: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.xxs,
    },
    indent: { paddingLeft: spacing.lg },
    label: {
      flex: 1.2,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    row: { alignItems: "stretch", flexDirection: "row", minHeight: 40 },
  });

  const rows: RowSpec[] = [
    {
      key: "balanceCents",
      kind: "result",
      label: labels.result,
      tone: "result",
    },
    {
      key: "incomeCents",
      kind: "detail",
      label: labels.income,
      tone: "income",
    },
    {
      key: "toReceiveCents",
      kind: "pending",
      label: labels.toReceive,
      tone: "income",
    },
    {
      key: "expenseCents",
      kind: "detail",
      label: labels.expenses,
      tone: "expense",
    },
    {
      key: "toPayCents",
      kind: "pending",
      label: labels.toPay,
      tone: "expense",
    },
  ];
  const showProjected = props.columns.some(
    (column) =>
      column.values.projectedIncomeCents > 0 ||
      column.values.projectedExpenseCents > 0,
  );

  function amount(spec: RowSpec, column: SummaryTableColumn) {
    const cents = column.values[spec.key];
    const primary = column.emphasis === "primary";
    const negative = spec.tone === "result" && cents < 0;
    let size: "body" | "caption" | "heading" = "body";
    if (spec.kind === "result" && primary) {
      size = "heading";
    } else if (spec.kind === "pending") {
      size = "caption";
    }
    let tone: "expense" | "income" | "secondary" | undefined;
    if (spec.tone === "result") {
      tone = negative ? undefined : "income";
    } else if (primary || spec.kind === "result") {
      tone = spec.tone;
    } else {
      tone = "secondary";
    }

    return (
      <UpdatingTotal updating={props.updating}>
        <AmountText
          currency={DEFAULT_CURRENCY}
          size={size}
          testID={`${props.testID}-${column.key}-${spec.key}`}
          tone={tone}
          type={negative ? "EXPENSE" : undefined}
          value={Math.abs(cents)}
        />
      </UpdatingTotal>
    );
  }

  function a11yValue(spec: RowSpec, column: SummaryTableColumn) {
    const cents = column.values[spec.key];

    return formatAmount(
      cents,
      localeTag,
      DEFAULT_CURRENCY,
      spec.tone === "result" && cents < 0 ? "EXPENSE" : undefined,
    );
  }

  return (
    <View testID={props.testID}>
      <View style={styles.header}>
        <View style={styles.label} />
        {props.columns.map((column) => (
          <Highlight
            active={column.emphasis === "primary"}
            fill
            key={column.key}
            testID={`${props.testID}-${column.key}-header`}
            tone={"warning"}
          >
            <View style={styles.cell}>
              {column.emphasis === "primary" ? (
                <View style={styles.headerName}>
                  <Icon color={colors.warning} name={"star"} size={14} />
                  <Text.BodyStrong numberOfLines={1} value={column.label} />
                </View>
              ) : (
                <Text.Caption tone={"secondary"} value={column.label} />
              )}
            </View>
          </Highlight>
        ))}
      </View>
      {rows.map((spec) => (
        <View key={spec.key}>
          <Divider />
          <View
            accessibilityLabel={props.rowA11yLabel(
              spec.label,
              props.columns.map((column) => a11yValue(spec, column)),
            )}
            accessible
            style={styles.row}
          >
            <View style={styles.label}>
              {spec.kind === "pending" ? (
                <View style={styles.indent}>
                  <Text.Caption tone={"secondary"} value={spec.label} />
                </View>
              ) : (
                <Text.Body value={spec.label} />
              )}
            </View>
            {props.columns.map((column) => (
              <Highlight
                active={column.emphasis === "primary"}
                fill
                key={column.key}
                tone={"warning"}
              >
                <View style={styles.cell}>{amount(spec, column)}</View>
              </Highlight>
            ))}
          </View>
        </View>
      ))}
      {showProjected ? (
        <View>
          <Divider />
          <View style={styles.row}>
            <View style={styles.label}>
              <View style={styles.indent}>
                <Text.Caption tone={"secondary"} value={labels.projected} />
              </View>
            </View>
            {props.columns.map((column) => (
              <Highlight
                active={column.emphasis === "primary"}
                fill
                key={column.key}
                tone={"warning"}
              >
                <View style={styles.cell}>
                  {column.values.projectedIncomeCents > 0 ? (
                    <AmountText
                      currency={DEFAULT_CURRENCY}
                      size={"caption"}
                      tone={"income"}
                      value={column.values.projectedIncomeCents}
                    />
                  ) : null}
                  {column.values.projectedExpenseCents > 0 ? (
                    <AmountText
                      currency={DEFAULT_CURRENCY}
                      size={"caption"}
                      tone={"expense"}
                      value={column.values.projectedExpenseCents}
                    />
                  ) : null}
                </View>
              </Highlight>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export type { SummaryTableColumn, SummaryTableLabels };
export default FavoriteTable;
