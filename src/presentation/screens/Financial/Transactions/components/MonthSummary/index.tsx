import { StyleSheet, View } from "react-native";

import { AmountText, Button, Card, Divider, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";

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
        <AmountText
          size={"heading"}
          type={negative ? "EXPENSE" : undefined}
          value={Math.abs(props.balanceCents)}
        />
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
          <AmountText
            testID={props.incomeTestID}
            tone={"income"}
            value={props.incomeCents}
          />
        </View>
        <Divider vertical />
        <View style={[styles.column, styles.columnRight]}>
          <Text.Overline tone={"secondary"} value={props.expensesLabel} />
          <AmountText
            testID={props.expenseTestID}
            tone={"expense"}
            value={props.expenseCents}
          />
        </View>
      </View>
      {props.toPayLabel && props.toReceiveLabel ? (
        <>
          <Divider />
          <View style={styles.metrics}>
            <View style={[styles.column, styles.columnLeft]}>
              <Text.Overline tone={"secondary"} value={props.toReceiveLabel} />
              <AmountText
                testID={props.toReceiveTestID}
                tone={"income"}
                value={props.toReceiveCents ?? 0}
              />
            </View>
            <Divider vertical />
            <View style={[styles.column, styles.columnRight]}>
              <Text.Overline tone={"secondary"} value={props.toPayLabel} />
              <AmountText
                testID={props.toPayTestID}
                tone={"expense"}
                value={props.toPayCents ?? 0}
              />
            </View>
          </View>
        </>
      ) : null}
    </Card>
  );
}

export default MonthSummary;
