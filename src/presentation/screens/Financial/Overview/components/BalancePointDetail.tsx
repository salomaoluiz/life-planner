import { View } from "react-native";

import { HighlightRow, Text } from "@components";
import { BalancePointEntity } from "@domain/entities/financial/DashboardEntity";
import { useTranslation } from "@presentation/i18n";

import { formatDay } from "../models/overviewFormat";
import useStyles from "../styles";
import overviewTestIds from "../testIds";

interface Props {
  // Mobile stacks the columns.
  compact: boolean;
  favoriteId?: string;
  localeTag: string;
  money: (cents: number) => string;
  point: BalancePointEntity;
}

// The detail of the chosen point. With a favorite: its highlighted row first, then the total, then the other accounts
// (two columns on web and tablet, spec 094 FR 19); without one, the total and every account as before.
function BalancePointDetail(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { favoriteId, localeTag, money, point } = props;
  const favorite = favoriteId
    ? point.accounts.find((account) => account.id === favoriteId)
    : undefined;
  const range = `${formatDay(point.start, localeTag)}${point.start === point.end ? "" : ` – ${formatDay(point.end, localeTag)}`}`;
  const others = point.accounts.filter(
    (account) => account.id !== favorite?.id,
  );

  const totalRow = (
    <View style={styles.detailRow}>
      <Text.Caption
        tone={favorite ? "secondary" : tone(point.balance)}
        value={t(
          favorite
            ? "financial.overview.balance.totalLegend"
            : "financial.overview.balance.total",
        )}
      />
      <Text.BodyStrong
        tabular
        tone={tone(point.balance)}
        value={money(point.balance)}
      />
    </View>
  );
  const otherRows = others.map((account) => (
    <View key={account.id} style={styles.detailRow}>
      <Text.Caption tone="secondary" value={account.name} />
      <Text.Caption
        tabular
        tone={tone(account.balance)}
        value={money(account.balance)}
      />
    </View>
  ));

  if (!favorite) {
    return (
      <View style={styles.detail} testID={overviewTestIds.balanceDetail}>
        <Text.Caption tone="secondary" value={range} />
        {totalRow}
        {otherRows}
      </View>
    );
  }

  return (
    <View style={styles.detail} testID={overviewTestIds.balanceDetail}>
      <Text.Caption tone="secondary" value={range} />
      <View style={props.compact ? styles.detailStack : styles.detailColumns}>
        <View style={styles.detailColumn}>
          <HighlightRow
            caption={t("financial.overview.balance.favoriteCaption")}
            icon="star"
            testID={overviewTestIds.balanceFavoriteRow}
            title={favorite.name}
            tone={tone(favorite.balance)}
            value={money(favorite.balance)}
          />
          {totalRow}
        </View>
        {others.length > 0 ? (
          <View
            style={styles.detailColumn}
            testID={overviewTestIds.balanceOtherAccounts}
          >
            <Text.Overline
              value={t("financial.overview.balance.otherAccounts")}
            />
            {otherRows}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function tone(cents: number) {
  return cents >= 0 ? "income" : "expense";
}

export default BalancePointDetail;
