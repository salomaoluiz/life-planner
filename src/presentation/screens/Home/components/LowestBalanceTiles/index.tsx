import { useState } from "react";
import { View } from "react-native";

import {
  AmountText,
  Card,
  Divider,
  ErrorState,
  Icon,
  Text,
  Tooltip,
  Touchable,
} from "@components";
import Skeleton from "@components/Skeleton";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";
import DayBalanceLine from "@screens/Financial/Transactions/components/DayBalanceLine";
import { BlockState } from "@screens/Home/hooks/useHomeViewModel";
import LowestBalanceUIModel, {
  LowestBalanceTile,
} from "@screens/Home/models/LowestBalanceUIModel";
import homeTestIds from "@screens/Home/testIds";
import { isWeb } from "@utils/platform";

import useStyles from "./styles";

interface Props {
  fill?: boolean;
  onCreateAccountPress: () => void;
  onPress: () => void;
  state: BlockState<LowestBalanceUIModel>;
}

function EmptyTile() {
  const { styles } = useStyles();

  return (
    <View style={styles.tile}>
      <Text.Caption value="—" />
    </View>
  );
}

function Lines({ tile }: { tile: LowestBalanceTile }) {
  const { t } = useTranslation();
  const { styles } = useStyles();

  return (
    <View style={styles.detail} testID={homeTestIds.financeLowestDetail}>
      <View style={styles.detailTitle}>
        <Text.Caption
          value={t("home.finance.lowest.detail", { date: tile.dateLabel })}
        />
      </View>
      {tile.lines.map((line) => (
        <DayBalanceLine
          accountId={line.accountId}
          balanceCents={line.balanceCents}
          favorite={line.favorite}
          icon={line.icon}
          isCards={false}
          key={line.accountId}
          name={line.name}
          variant="tooltip"
        />
      ))}
      <Divider />
      <View style={styles.total}>
        <Text.Caption value={t("home.finance.lowest.total")} />
        <AmountText
          currency={DEFAULT_CURRENCY}
          size="body"
          type={tile.filterTotalCents < 0 ? "EXPENSE" : undefined}
          value={Math.abs(tile.filterTotalCents)}
        />
      </View>
    </View>
  );
}

// The lowest balance day of this month (from today) and of next month, with the balance by account (spec 062 FR 8-11).
function LowestBalanceTiles({
  fill,
  onCreateAccountPress,
  onPress,
  state,
}: Props) {
  const { t } = useTranslation();
  const { styles } = useStyles();

  if (state.isLoading) {
    return <Skeleton.Card testID={homeTestIds.financeLowestLoading} />;
  }

  if (state.isError || !state.data) {
    return (
      <ErrorState
        message={t("common.errors.generic")}
        onRetry={state.onRetry}
        retryLabel={t("common.actions.tryAgain")}
        testID={homeTestIds.financeLowestError}
      />
    );
  }

  const { data } = state;

  return (
    <Card fill={fill}>
      <View style={styles.root}>
        <Text.Overline
          value={
            data.favoriteName
              ? t("home.finance.lowest.titleFavorite", {
                  name: data.favoriteName,
                })
              : t("home.finance.lowest.title")
          }
        />
        <View style={styles.tiles}>
          {data.hasAccounts ? (
            data.tiles.map((tile) => (
              <Tile key={tile.id} onPress={onPress} tile={tile} />
            ))
          ) : (
            <>
              <EmptyTile />
              <EmptyTile />
            </>
          )}
        </View>
        {!data.hasAccounts && (
          <View>
            <Text.Caption value={t("home.finance.lowest.noAccounts")} />
            <Touchable
              accessibilityRole="link"
              onPress={onCreateAccountPress}
              testID={homeTestIds.financeLowestCreateAccount}
            >
              <Text.BodyStrong
                tone="accent"
                value={t("home.finance.lowest.createAccount")}
              />
            </Touchable>
          </View>
        )}
      </View>
    </Card>
  );
}

function Tile({
  onPress,
  tile,
}: {
  onPress: () => void;
  tile: LowestBalanceTile;
}) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const web = isWeb();

  return (
    <View style={styles.tile}>
      <Tooltip content={web ? <Lines tile={tile} /> : undefined}>
        <Card
          onPress={onPress}
          testID={
            tile.id === "current"
              ? homeTestIds.financeLowestCurrent
              : homeTestIds.financeLowestNext
          }
        >
          <View style={styles.tileHeader}>
            <View style={styles.tileText}>
              <Text.Caption
                value={t("home.finance.lowest.day", {
                  day: tile.day,
                  month: tile.monthName,
                })}
              />
              <AmountText
                currency={DEFAULT_CURRENCY}
                size="body"
                type={tile.isNegative ? "EXPENSE" : undefined}
                value={Math.abs(tile.totalCents)}
              />
            </View>
            {!web && (
              <Touchable
                accessibilityLabel={t(
                  expanded
                    ? "home.finance.lowest.hide"
                    : "home.finance.lowest.show",
                )}
                accessibilityRole="button"
                expanded={expanded}
                onPress={() => setExpanded((value) => !value)}
                testID={`${homeTestIds.financeLowestToggle}-${tile.id}`}
              >
                <Icon
                  color={theme.colors.textSecondary}
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={theme.sizes.size.iconMd}
                />
              </Touchable>
            )}
          </View>
        </Card>
      </Tooltip>
      {!web && expanded && <Lines tile={tile} />}
    </View>
  );
}

export default LowestBalanceTiles;
