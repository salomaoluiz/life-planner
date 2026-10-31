import { StyleSheet, View } from "react-native";

import { AmountText, Button, Card, Divider, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import UpdatingTotal from "@screens/Financial/Transactions/components/UpdatingTotal";

interface Props {
  balanceCents: number;
  balanceLabel: string;
  errorMessage: string;
  expenseCents: number;
  expensesLabel: string;
  expenseTestID?: string;
  incomeCents: number;
  incomesLabel: string;
  incomeTestID?: string;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  // Spec 034 FR 15: what series will add to a future month; the line is hidden when both are zero.
  projectedExpenseCents?: number;
  projectedIncomeCents?: number;
  projectedLabel?: string;
  projectedTestID?: string;
  retryLabel: string;
  scopeLabel: string;
  scopeTestID?: string;
  testID?: string;
  toPayCents?: number;
  toPayLabel?: string;
  toPayTestID?: string;
  toReceiveCents?: number;
  toReceiveLabel?: string;
  toReceiveTestID?: string;
  // Spec 061: a change is still being saved; the figures are the old ones.
  updating?: boolean;
}

function MonthSummary(props: Props) {
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    column: {
      flex: 1,
      gap: spacing.xs,
      paddingVertical: spacing.md,
    },
    columnLeft: { paddingLeft: spacing.lg, paddingRight: spacing.md },
    columnRight: { paddingLeft: spacing.md, paddingRight: spacing.lg },
    metrics: { flexDirection: "row" },
    pending: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    projected: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    top: { gap: spacing.xs, padding: spacing.lg },
  });

  if (props.isLoading) {
    return <Skeleton.Card />;
  }

  if (props.isError) {
    return (
      <Card>
        <Text.Body tone={"expense"} value={props.errorMessage} />
        <Button.Ghost inline label={props.retryLabel} onPress={props.onRetry} />
      </Card>
    );
  }

  const negative = props.balanceCents < 0;

  return (
    <Card customStyles={{ padding: 0 }} testID={props.testID}>
      <View style={styles.top}>
        <Text.Overline tone={"secondary"} value={props.balanceLabel} />
        <UpdatingTotal updating={props.updating}>
          <AmountText
            currency={DEFAULT_CURRENCY}
            size={"heading"}
            type={negative ? "EXPENSE" : undefined}
            value={Math.abs(props.balanceCents)}
          />
        </UpdatingTotal>
        <Text.Caption
          testID={props.scopeTestID}
          tone={"secondary"}
          value={props.scopeLabel}
        />
      </View>
      <Divider />
      <View style={styles.metrics}>
        <View style={[styles.column, styles.columnLeft]}>
          <Text.Overline tone={"secondary"} value={props.incomesLabel} />
          <UpdatingTotal updating={props.updating}>
            <AmountText
              currency={DEFAULT_CURRENCY}
              testID={props.incomeTestID}
              tone={"income"}
              value={props.incomeCents}
            />
          </UpdatingTotal>
          {props.toReceiveLabel ? (
            <View style={styles.pending}>
              <Text.Caption tone={"secondary"} value={props.toReceiveLabel} />
              <AmountText
                currency={DEFAULT_CURRENCY}
                size={"caption"}
                testID={props.toReceiveTestID}
                tone={"income"}
                value={props.toReceiveCents ?? 0}
              />
            </View>
          ) : null}
        </View>
        <Divider vertical />
        <View style={[styles.column, styles.columnRight]}>
          <Text.Overline tone={"secondary"} value={props.expensesLabel} />
          <UpdatingTotal updating={props.updating}>
            <AmountText
              currency={DEFAULT_CURRENCY}
              testID={props.expenseTestID}
              tone={"expense"}
              value={props.expenseCents}
            />
          </UpdatingTotal>
          {props.toPayLabel ? (
            <View style={styles.pending}>
              <Text.Caption tone={"secondary"} value={props.toPayLabel} />
              <AmountText
                currency={DEFAULT_CURRENCY}
                size={"caption"}
                testID={props.toPayTestID}
                tone={"expense"}
                value={props.toPayCents ?? 0}
              />
            </View>
          ) : null}
        </View>
      </View>
      {props.projectedLabel &&
      (props.projectedExpenseCents || props.projectedIncomeCents) ? (
        <>
          <Divider />
          <View style={styles.projected} testID={props.projectedTestID}>
            <Text.Caption tone={"secondary"} value={props.projectedLabel} />
            <View style={styles.pending}>
              {props.projectedIncomeCents ? (
                <AmountText
                  currency={DEFAULT_CURRENCY}
                  size={"caption"}
                  tone={"income"}
                  value={props.projectedIncomeCents}
                />
              ) : null}
              {props.projectedExpenseCents ? (
                <AmountText
                  currency={DEFAULT_CURRENCY}
                  size={"caption"}
                  tone={"expense"}
                  value={props.projectedExpenseCents}
                />
              ) : null}
            </View>
          </View>
        </>
      ) : null}
    </Card>
  );
}

export default MonthSummary;
