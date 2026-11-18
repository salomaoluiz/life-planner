import { View } from "react-native";

import { AmountText, Button, Card, ErrorState, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { toCurrencyCode } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import ShoppingListSummaryUIModel from "@screens/Home/models/ShoppingListSummaryUIModel";
import homeTestIds from "@screens/Home/testIds";

interface Props {
  fill?: boolean;
  onSeeAllPress: () => void;
  state: BlockState<ShoppingListSummaryUIModel>;
}

// Spec 118 FR 26: the rows the stock asked for, grouped by list, next to "Pedem atenção".
function StockShoppingListCard({ fill, onSeeAllPress, state }: Props) {
  const { t } = useTranslation();

  if (state.isLoading) {
    return <Skeleton.Card testID={homeTestIds.shoppingListLoading} />;
  }

  if (state.isError) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={homeTestIds.shoppingListError}
      />
    );
  }

  const { data } = state;

  if (!data || data.isEmpty) {
    return null;
  }

  return (
    <Card fill={fill} testID={homeTestIds.shoppingListCard}>
      <Text.Heading value={`${t("home.stock.shoppingList")} · ${data.count}`} />
      <Text.Caption value={t("home.stock.shoppingListHint")} />
      {data.totals.map((total) => (
        <View key={total.currency}>
          <AmountText
            currency={toCurrencyCode(total.currency)}
            size="heading"
            testID={`${homeTestIds.shoppingListTotal}-${total.currency}`}
            value={total.estimatedTotalCents}
          />
          <Text.Caption
            value={t("home.stock.shoppingListCoverage", {
              priced: total.pricedCount,
              total: data.count,
            })}
          />
        </View>
      ))}
      {data.groups.map((group) => (
        <View key={group.id}>
          <Text.Overline value={group.title} />
          {group.rows.map((row) => (
            <View key={`${group.id}-${row.description}`}>
              <Text.Body
                testID={homeTestIds.shoppingListRow}
                value={`${row.description} · ${row.quantityText} ${t(row.unitKey)}`}
              />
            </View>
          ))}
        </View>
      ))}
      <Button.Ghost
        label={
          data.remaining > 0
            ? t("home.stock.shoppingListSeeAll", { count: data.remaining })
            : t("home.stock.shoppingListSeeLists")
        }
        onPress={onSeeAllPress}
        testID={homeTestIds.shoppingListSeeAll}
      />
    </Card>
  );
}

export default StockShoppingListCard;
