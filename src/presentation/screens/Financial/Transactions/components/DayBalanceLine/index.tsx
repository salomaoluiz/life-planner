import { View } from "react-native";

import { AmountText, GroupBodyRow, IconTile, Text } from "@components";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import UpdatingTotal from "@screens/Financial/Transactions/components/UpdatingTotal";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "./styles";

interface Props {
  accountId?: string;
  balanceCents: number;
  icon: string;
  isCards: boolean;
  // Closes the card opened by the day header (list variant only).
  isLast?: boolean;
  name: string;
  // Spec 061: a change is still being saved; the balance is the old one.
  updating?: boolean;
  // `tooltip` = the web hover bubble, `list` = the lines under an expanded day header.
  variant?: "list" | "tooltip";
}

// One line of the expanded day: an account balance, or the card invoices still to pay (spec 035 FR 12).
function DayBalanceLine(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const negative = props.balanceCents < 0;

  return (
    <GroupBodyRow
      isLast={props.isLast}
      testID={
        props.isCards
          ? transactionsTestIds.dayBalanceCards
          : `${transactionsTestIds.dayBalanceLine}-${props.accountId}`
      }
      variant={props.variant === "tooltip" ? "bare" : "card"}
    >
      <View style={styles.row}>
        <IconTile
          name={props.icon}
          size="sm"
          tone={props.isCards ? "expense" : "accent"}
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
        <UpdatingTotal updating={props.updating}>
          <AmountText
            currency={DEFAULT_CURRENCY}
            size="body"
            type={negative ? "EXPENSE" : undefined}
            value={Math.abs(props.balanceCents)}
          />
        </UpdatingTotal>
      </View>
    </GroupBodyRow>
  );
}

export default DayBalanceLine;
