import { View } from "react-native";

import { Badge, IconTile, ListItem } from "@components";
import { StockExpirationStatus } from "@domain/entities/stock/StockEntity";
import { useTranslation } from "@presentation/i18n";
import StockQuickStepper from "@screens/Stock/components/StockQuickStepper";
import { StockQuickMovementVM } from "@screens/Stock/hooks/useStockQuickMovement";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";
import useStyles from "@screens/Stock/styles";
import stockTestIds from "@screens/Stock/testIds";

interface Props {
  item: StockItemUIModel;
  onPress?: () => void;
  quick: StockQuickMovementVM;
}

function badgeTestId(labelKey: string) {
  const ids: Record<string, string> = {
    "stock.badge.expired": stockTestIds.statusExpired,
    "stock.badge.expiring": stockTestIds.statusExpiring,
    "stock.badge.opened": stockTestIds.statusOpened,
    "stock.badge.restock": stockTestIds.statusRestock,
  };

  return ids[labelKey];
}

// The row of the stock list, the quick add and the location route (spec 117 §8): tapping the name opens the
// detail, the right side is the stepper; the badges sit under the subtitle.
function StockQuickRow({ item, onPress, quick }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const info = item.dateInfo;
  let date = "";

  if (info?.minimum) {
    date = t(info.key, {
      quantity: `${info.minimum.text} ${t(info.minimum.unitKey)}`,
    });
  } else if (info) {
    date = t(info.key, { date: info.date });
  } else if (item.status === StockExpirationStatus.NONE) {
    date = t("stock.list.date.noExpiration");
  }

  const quantity = `${item.quantity.text} ${t(item.quantity.unitKey)}`;
  const badgeLabels = item.badges.map((badge) => t(badge.labelKey));

  return (
    <ListItem
      accessibilityLabel={t("stock.list.rowA11y", {
        name: item.description,
        quantity,
        status: badgeLabels.join(", "),
      })}
      inset
      leading={<IconTile name={item.iconTile.icon} tone={item.iconTile.tone} />}
      meta={
        item.badges.length > 0 ? (
          <View style={styles.badges}>
            {item.badges.map((badge) => (
              <Badge
                key={badge.labelKey}
                label={t(badge.labelKey)}
                testID={badgeTestId(badge.labelKey)}
                tone={badge.tone}
              />
            ))}
          </View>
        ) : undefined
      }
      onPress={onPress}
      subtitle={[item.subtitle, date].filter(Boolean).join(" · ")}
      testID={stockTestIds.row}
      title={item.description}
      trailing={<StockQuickStepper item={item} quick={quick} />}
    />
  );
}

export default StockQuickRow;
