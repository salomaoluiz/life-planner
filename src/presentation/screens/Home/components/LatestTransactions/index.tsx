import {
  AmountText,
  EmptyState,
  ErrorState,
  IconTile,
  ListItem,
  Section,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import RecentTransactionUIModel from "@screens/Home/models/RecentTransactionUIModel";

interface Props {
  onAddPress: () => void;
  onSeeAllPress: () => void;
  state: BlockState<RecentTransactionUIModel[]>;
}

function LatestTransactions({ onAddPress, onSeeAllPress, state }: Props) {
  const { t } = useTranslation();

  function renderBody() {
    if (state.isLoading) {
      return [0, 1, 2].map((index) => (
        <Skeleton.ListItem key={index} testID="home-transactions-loading" />
      ));
    }

    if (state.isError || !state.data) {
      return (
        <ErrorState
          message={t("common.errors.generic")}
          onRetry={state.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID="home-transactions-error"
        />
      );
    }

    if (state.data.length === 0) {
      return (
        <EmptyState
          actionLabel={t("home.transactions.add")}
          message={t("home.transactions.emptyMessage")}
          onAction={onAddPress}
          testID="home-transactions-empty"
          title={t("home.transactions.emptyTitle")}
        />
      );
    }

    return state.data.map((row) => (
      <ListItem
        divider
        key={row.id}
        leading={
          <IconTile
            color={row.categoryColor}
            name={row.categoryIcon ?? "tag-outline"}
          />
        }
        onPress={onSeeAllPress}
        subtitle={t("home.transactions.subtitle", {
          category: row.categoryName,
          date: row.dateKey ? t(row.dateKey) : row.dateText,
        })}
        testID={`home-transaction-${row.id}`}
        title={row.title}
        trailing={
          <AmountText
            size="body"
            type={row.amount.type}
            value={row.amount.value}
          />
        }
      />
    ));
  }

  return (
    <Section
      actionLabel={t("common.actions.seeAll")}
      onActionPress={onSeeAllPress}
      title={t("home.transactions.title")}
    >
      {renderBody()}
    </Section>
  );
}

export default LatestTransactions;
