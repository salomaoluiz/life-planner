import { View } from "react-native";

import { Badge, Button, Card, Text } from "@components";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { formatDay, formatMoney } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import useStyles from "../styles";

interface Props {
  asset: InvestmentAsset;
  onConfirm: (id: string) => void;
  readOnly: boolean;
}

// Spec 105 FR 25: a matured title with principal left is highlighted first, with "Confirm redemption"; the owner
// types the real amount that landed in the account.
function PendingMaturityCard({ asset, onConfirm, readOnly }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const fixedIncome = asset.fixedIncome;

  if (!fixedIncome) {
    return null;
  }

  return (
    <Card testID={`${investmentTestIds.list.pendingCard}-${asset.id}`}>
      <View style={styles.cardTop}>
        <Text.BodyStrong
          tone="warning"
          value={t("investment.fixedIncome.pending.title", {
            date: formatDay(fixedIncome.maturityDate, localeTag),
          })}
        />
        <Badge
          label={t("investment.fixedIncome.pending.chip")}
          tone="warning"
        />
      </View>
      <Text.Body value={asset.name} />
      <Text.Caption
        tabular
        tone="secondary"
        value={t("investment.fixedIncome.pending.body", {
          net: formatMoney(fixedIncome.today.net, "BRL", localeTag),
        })}
      />
      {readOnly ? null : (
        <Button.Primary
          label={t("investment.fixedIncome.pending.action")}
          onPress={() => onConfirm(asset.id)}
          testID={`${investmentTestIds.list.pendingConfirm}-${asset.id}`}
        />
      )}
    </Card>
  );
}

export default PendingMaturityCard;
