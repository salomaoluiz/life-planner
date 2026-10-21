import { StyleSheet, View } from "react-native";

import { AmountText, Card, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { FilteredSummary as FilteredSummaryData } from "@screens/Financial/Transactions/models/transactionFilters";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  caption: string;
  expensesLabel: string;
  incomesLabel: string;
  resultLabel: string;
  summary: FilteredSummaryData;
}

// Income, expenses and result of the filtered list, with how many transactions it holds (spec 045 FR 13).
function FilteredSummary(props: Props) {
  const { spacing } = useKitTheme();
  const { summary } = props;
  const styles = StyleSheet.create({
    column: { flex: 1, gap: spacing.xxs },
    metrics: { flexDirection: "row", gap: spacing.md },
  });

  return (
    <Card testID={transactionsTestIds.filteredSummary}>
      <View style={styles.metrics}>
        <View style={styles.column}>
          <Text.Overline tone={"secondary"} value={props.incomesLabel} />
          <AmountText
            currency={DEFAULT_CURRENCY}
            tone={"income"}
            value={summary.incomeCents}
          />
        </View>
        <View style={styles.column}>
          <Text.Overline tone={"secondary"} value={props.expensesLabel} />
          <AmountText
            currency={DEFAULT_CURRENCY}
            tone={"expense"}
            value={summary.expenseCents}
          />
        </View>
        <View style={styles.column}>
          <Text.Overline tone={"secondary"} value={props.resultLabel} />
          <AmountText
            currency={DEFAULT_CURRENCY}
            type={summary.resultCents < 0 ? "EXPENSE" : undefined}
            value={Math.abs(summary.resultCents)}
          />
        </View>
      </View>
      <Text.Caption tone={"secondary"} value={props.caption} />
    </Card>
  );
}

export default FilteredSummary;
