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
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import StockAttentionUIModel from "@screens/Home/models/StockAttentionUIModel";

interface Props {
  onAddItemPress: () => void;
  onSeeAllPress: () => void;
  state: BlockState<StockAttentionUIModel>;
}

function StockAttentionCard({ onAddItemPress, onSeeAllPress, state }: Props) {
  const { t } = useTranslation();

  if (state.isLoading) {
    return <Skeleton.Card testID="home-stock-loading" />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID="home-stock-error"
      />
    );
  }

  const { data } = state;

  return (
    <Card testID="home-stock">
      <Section
        actionLabel={t("common.actions.seeAll")}
        onActionPress={onSeeAllPress}
        title={t("home.stock.title")}
      >
        <Text.Caption
          testID="home-stock-count"
          value={t("home.stock.count", data.countLabelParams)}
        />
        {data.isEmpty && (
          <ListItem
            leading={<IconTile name="package-variant-closed" tone="neutral" />}
            testID="home-stock-empty"
            title={t("home.stock.empty")}
            trailing={
              <Button.Ghost
                label={t("home.stock.addItem")}
                onPress={onAddItemPress}
              />
            }
          />
        )}
        {data.isNothingExpiring && (
          <ListItem
            leading={<IconTile name="check" tone="income" />}
            testID="home-stock-nothing-expiring"
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
            testID={`home-stock-row-${row.id}`}
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
