import { View } from "react-native";

import { AmountText, Button, Card, MetricBlock, Text } from "@components";
import Skeleton from "@components/Skeleton";
import useStyles from "@screens/Financial/Transactions/styles";

interface Props {
  balanceCents: number;
  balanceLabel: string;
  errorMessage: string;
  expenseCents: number;
  expensesLabel: string;
  incomeCents: number;
  incomesLabel: string;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  retryLabel: string;
}

function MonthSummary(props: Props) {
  const { styles } = useStyles();

  if (props.isLoading) {
    return <Skeleton.Card />;
  }

  if (props.isError) {
    return (
      <Card>
        <Text.Body tone={"expense"} value={props.errorMessage} />
        <Button.Ghost label={props.retryLabel} onPress={props.onRetry} />
      </Card>
    );
  }

  const negative = props.balanceCents < 0;

  return (
    <Card>
      <Text.Overline tone={"secondary"} value={props.balanceLabel} />
      <AmountText
        size={"heading"}
        type={negative ? "EXPENSE" : undefined}
        value={Math.abs(props.balanceCents)}
      />
      <View style={styles.summaryRow}>
        <MetricBlock
          label={props.incomesLabel}
          trend={"income"}
          value={<AmountText tone={"income"} value={props.incomeCents} />}
        />
        <MetricBlock
          label={props.expensesLabel}
          trend={"expense"}
          value={<AmountText tone={"expense"} value={props.expenseCents} />}
        />
      </View>
    </Card>
  );
}

export default MonthSummary;
