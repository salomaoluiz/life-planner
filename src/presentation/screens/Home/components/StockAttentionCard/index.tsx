import {
  Badge,
  Button,
  Card,
  ErrorState,
  IconTile,
  ListItem,
  Section,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import StockAttentionUIModel from "@screens/Home/models/StockAttentionUIModel";
import homeTestIds from "@screens/Home/testIds";

interface Props {
  fill?: boolean;
  onAddItemPress: () => void;
  onSeeAllPress: () => void;
  state: BlockState<StockAttentionUIModel>;
}

function StockAttentionCard({
  fill,
  onAddItemPress,
  onSeeAllPress,
  state,
}: Props) {
  const { t } = useTranslation();

  if (state.isLoading) {
    return <Skeleton.Card testID={homeTestIds.stockAttentionLoading} />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={homeTestIds.stockAttentionError}
      />
    );
  }

  const { data } = state;

  return (
    <Card fill={fill} testID={homeTestIds.stockAttentionCard}>
      <Section
        actionLabel={t("common.actions.seeAll")}
        onActionPress={onSeeAllPress}
        title={t("home.stock.title")}
      >
        <Text.Caption
          testID={homeTestIds.stockAttentionCount}
          value={t(
            pluralKey("home.stock.count", data.countLabelParams.count),
            data.countLabelParams,
          )}
        />
        {data.isEmpty && (
          <ListItem
            leading={<IconTile name="package-variant-closed" tone="neutral" />}
            testID={homeTestIds.stockAttentionEmpty}
            title={t("home.stock.empty")}
            trailing={
              <Button.Ghost
                inline
                label={t("home.stock.addItem")}
                onPress={onAddItemPress}
              />
            }
          />
        )}
        {data.isNothingExpiring && (
          <ListItem
            leading={<IconTile name="check" tone="income" />}
            testID={homeTestIds.stockAttentionNothingExpiring}
            title={t("home.stock.nothingExpiring")}
          />
        )}
        {data.rows.map((row) => (
          <ListItem
            key={row.id}
            leading={
              <IconTile
                name={row.isExpired ? "alert-circle-outline" : "clock-outline"}
                tone={row.isExpired ? "expense" : "warning"}
              />
            }
            onPress={onSeeAllPress}
            subtitle={t("home.stock.subtitle", {
              ownerName: row.ownerName,
              quantity: row.quantity,
              unit: t(row.unitKey),
            })}
            testID={homeTestIds.stockAttentionRow}
            title={row.title}
            trailing={
              <Badge
                label={t(row.badge.key, row.badge.params)}
                tone={row.isExpired ? "expense" : "warning"}
              />
            }
          />
        ))}
      </Section>
    </Card>
  );
}

export default StockAttentionCard;
