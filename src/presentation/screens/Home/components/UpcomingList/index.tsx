import { View } from "react-native";

import { UpcomingItemDTO } from "@application/dto/home/UpcomingDTO";
import {
  AmountText,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconTile,
  ListItem,
  ScrollBox,
  Section,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { useBreakpoint } from "@presentation/theme";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import UpcomingUIModel, {
  UpcomingRowUIModel,
} from "@screens/Home/models/UpcomingUIModel";
import homeTestIds from "@screens/Home/testIds";

import useStyles from "./styles";

interface Props {
  fill?: boolean;
  onAddTransactionPress: () => void;
  onInvoicePress: (item: UpcomingItemDTO) => void;
  onItemPress: (item: UpcomingItemDTO) => void;
  onSeeAllPress: () => void;
  state: BlockState<UpcomingUIModel>;
}

const MAX_HEIGHT_EXPANDED = 440;
const MAX_HEIGHT_COMPACT = 320;

function Row({
  onInvoicePress,
  onItemPress,
  row,
}: {
  onInvoicePress: (item: UpcomingItemDTO) => void;
  onItemPress: (item: UpcomingItemDTO) => void;
  row: UpcomingRowUIModel;
}) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const item = row.value;
  const badge = row.badge;

  return (
    <ListItem
      divider
      leading={<IconTile name={row.icon} tone={row.tone} />}
      meta={
        badge ? (
          <Badge label={t(badge.key, badge.params)} tone={badge.tone} />
        ) : undefined
      }
      onPress={() => (row.isInvoice ? onInvoicePress(item) : onItemPress(item))}
      subtitle={
        row.isInvoice
          ? t(pluralKey("home.upcoming.purchases", row.purchaseCount), {
              count: row.purchaseCount,
              date: row.dateText,
            })
          : row.dateText
      }
      testID={homeTestIds.financeUpcomingItem}
      title={
        row.isInvoice
          ? t("home.upcoming.invoice", { card: item.description })
          : item.description
      }
      trailing={
        <View style={styles.trailing}>
          <AmountText
            currency={row.currency}
            size="body"
            type={row.amount.type}
            value={row.amount.value}
          />
          {row.isInvoice && (
            <Button.Ghost
              inline
              label={t("home.upcoming.seeTransactions")}
              onPress={() => onInvoicePress(item)}
              testID={homeTestIds.financeUpcomingInvoiceButton}
            />
          )}
        </View>
      }
    />
  );
}

// Everything overdue plus the next few days, in a box that scrolls on its own (spec 062 FR 12-18).
function UpcomingList({
  fill,
  onAddTransactionPress,
  onInvoicePress,
  onItemPress,
  onSeeAllPress,
  state,
}: Props) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const breakpoint = useBreakpoint();

  function renderBody() {
    if (state.isLoading) {
      return [0, 1, 2].map((index) => (
        <Skeleton.ListItem
          key={index}
          testID={homeTestIds.financeUpcomingLoading}
        />
      ));
    }

    if (state.isError || !state.data) {
      return (
        <ErrorState
          message={t("common.errors.generic")}
          onRetry={state.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={homeTestIds.financeUpcomingError}
        />
      );
    }

    const { data } = state;

    if (data.isEmpty) {
      return (
        <EmptyState
          actionLabel={t("home.upcoming.newTransaction")}
          icon="check-circle-outline"
          message={t("home.upcoming.emptyMessage")}
          onAction={onAddTransactionPress}
          testID={homeTestIds.financeUpcomingEmpty}
          title={t("home.upcoming.emptyTitle")}
        />
      );
    }

    return (
      <ScrollBox
        accessibilityLabel={t("home.upcoming.listLabel")}
        maxHeight={
          breakpoint === "expanded" ? MAX_HEIGHT_EXPANDED : MAX_HEIGHT_COMPACT
        }
      >
        {data.overdue.count > 0 && (
          <>
            <View
              style={styles.groupHeader}
              testID={homeTestIds.financeUpcomingOverdueHeader}
            >
              <Text.Caption
                tone="expense"
                value={t("home.upcoming.overdue", {
                  count: data.overdue.count,
                })}
              />
              <AmountText
                currency="BRL"
                size="caption"
                type="EXPENSE"
                value={data.overdue.expenseTotal}
              />
            </View>
            {data.overdue.rows.map((row) => (
              <Row
                key={row.id}
                onInvoicePress={onInvoicePress}
                onItemPress={onItemPress}
                row={row}
              />
            ))}
          </>
        )}
        {data.next.rows.length > 0 && (
          <>
            <View style={styles.groupHeader}>
              <Text.Caption
                value={t("home.upcoming.next", { count: data.next.count })}
              />
            </View>
            {data.next.rows.map((row) => (
              <Row
                key={row.id}
                onInvoicePress={onInvoicePress}
                onItemPress={onItemPress}
                row={row}
              />
            ))}
          </>
        )}
      </ScrollBox>
    );
  }

  return (
    <Card fill={fill} testID={homeTestIds.financeUpcoming}>
      <Section
        actionLabel={t("common.actions.seeAll")}
        onActionPress={onSeeAllPress}
        title={t("home.upcoming.title")}
        variant="overline"
      >
        <Text.Caption value={t("home.upcoming.subtitle")} />
        {renderBody()}
      </Section>
    </Card>
  );
}

export default UpcomingList;
