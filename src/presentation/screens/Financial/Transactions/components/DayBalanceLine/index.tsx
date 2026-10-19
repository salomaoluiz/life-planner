import { View } from "react-native";

import { AmountText, Icon, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "./styles";

interface Props {
  accountId?: string;
  balanceCents: number;
  icon: string;
  isCards: boolean;
  name: string;
}

// One line of the expanded day: an account balance, or the card invoices still to pay (spec 035 FR 12).
function DayBalanceLine(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const negative = props.balanceCents < 0;

  return (
    <View
      style={styles.root}
      testID={
        props.isCards
          ? transactionsTestIds.dayBalanceCards
          : `${transactionsTestIds.dayBalanceLine}-${props.accountId}`
      }
    >
      <Icon
        color={theme.colors.textSecondary}
        name={props.icon}
        size={theme.sizes.size.iconMd}
      />
      <View style={styles.title}>
        <Text.Body
          numberOfLines={1}
          value={
            props.isCards
              ? t("financial.transactions.dayBalance.cardsDue")
              : props.name
          }
        />
      </View>
      <AmountText
        size="body"
        type={negative ? "EXPENSE" : undefined}
        value={Math.abs(props.balanceCents)}
      />
    </View>
  );
}

export default DayBalanceLine;
