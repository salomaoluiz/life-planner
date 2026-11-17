import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  ErrorState,
  FormColumns,
  LineChart,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { formatDay } from "@screens/Investment/models/format";
import {
  monthLabel,
  percentLabel,
} from "@screens/Investment/Settings/models/settingsModel";
import settingsTestIds from "@screens/Investment/Settings/testIds";

import { IndexHistoryVM } from "../hooks";
import {
  chartPoints,
  deltaLabel,
  HISTORY_PERIODS,
} from "../models/historyModel";

const ids = settingsTestIds.history;
const NAMES = { CDI: "CDI", IPCA: "IPCA", SELIC: "Selic" } as const;

// Spec 113 FR 22 (artboards "histórico do índice" and "Mobile"): two columns on web/tablet (period and chart on the
// left, changes and followers on the right), stacked in the bottom sheet on mobile.
function Wide({ vm }: AdaptiveViewProps<IndexHistoryVM>) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    changes: { gap: spacing.xs },
    row: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    stack: { gap: spacing.md },
  });
  const name = NAMES[vm.index];
  const isIpca = vm.index === "IPCA";

  function labelOf(value: string): string {
    return value.length === 7
      ? monthLabel(value, localeTag)
      : formatDay(value, localeTag);
  }

  function renderChart() {
    const history = vm.history;

    if (!history) {
      return null;
    }

    const points = chartPoints(history, labelOf);
    const summary = history.changes
      .map((change) =>
        t("investment.settings.history.chartStep", {
          date: formatDay(change.since, localeTag),
          value: percentLabel(change.value, 2, localeTag),
        }),
      )
      .join(", ");

    return points.length === 0 ? (
      <Text.Caption
        tone="secondary"
        value={t("investment.settings.history.noChanges")}
      />
    ) : (
      <LineChart
        accessibilityLabel={t("investment.settings.history.chart", {
          index: name,
          summary,
        })}
        formatTick={(value) => `${percentLabel(String(value), 2, localeTag)}%`}
        formatValue={(value) => `${percentLabel(String(value), 2, localeTag)}%`}
        maxLabels={5}
        points={points}
        testID={ids.chart}
      />
    );
  }

  function renderChanges() {
    const history = vm.history;

    if (!history || isIpca) {
      return null;
    }

    return (
      <View style={styles.changes} testID={ids.changes}>
        <Text.BodyStrong value={t("investment.settings.history.changes")} />
        <View style={styles.row}>
          <Text.Caption
            tone="secondary"
            value={t("investment.settings.history.since")}
          />
          <Text.Caption
            tone="secondary"
            value={t("investment.settings.history.value", { index: name })}
          />
          <Text.Caption
            tone="secondary"
            value={t("investment.settings.history.delta")}
          />
        </View>
        {history.changes.map((change) => (
          <View key={change.since} style={styles.row}>
            <Text.Body value={formatDay(change.since, localeTag)} />
            <Text.BodyStrong
              tabular
              value={`${percentLabel(change.value, 2, localeTag)}%`}
            />
            <Text.Body
              tabular
              value={
                change.delta === null
                  ? "—"
                  : t("investment.settings.history.deltaValue", {
                      delta: deltaLabel(change.delta, localeTag),
                    })
              }
            />
          </View>
        ))}
      </View>
    );
  }

  function renderFollowers() {
    const followers = vm.history?.followers ?? [];

    if (followers.length === 0) {
      return null;
    }

    return (
      <Card testID={ids.followers}>
        <View style={styles.changes}>
          <Text.BodyStrong
            value={t("investment.settings.history.followers", {
              count: followers.length,
              index: name,
            })}
          />
          {followers.map((follower) => (
            <Button.Ghost
              inline
              key={follower.assetId}
              label={`${follower.name} ${
                follower.percent
                  ? `${percentLabel(follower.percent, 0, localeTag)}%`
                  : `+ ${percentLabel(follower.spread, 2, localeTag)}%`
              }`}
              onPress={() => vm.onAssetPress(follower.assetId)}
              testID={ids.follower(follower.assetId)}
            />
          ))}
        </View>
      </Card>
    );
  }

  function renderBody() {
    if (vm.isError) {
      return (
        <ErrorState
          message={t("investment.settings.error")}
          onRetry={vm.onRetry}
          retryLabel={t("investment.settings.retry")}
        />
      );
    }

    return (
      <FormColumns
        left={
          <View style={styles.stack}>
            <ChipGroup
              mode="single"
              onChange={vm.onPeriodChange}
              options={HISTORY_PERIODS.map((period) => ({
                label: t(`investment.settings.history.period.${period}`),
                testID: ids.period(period),
                value: period,
              }))}
              testID={ids.period("group")}
              value={vm.period}
            />
            {vm.isLoading ? <Skeleton.Card /> : renderChart()}
            {isIpca ? null : (
              <Text.Caption
                tone="secondary"
                value={t("investment.settings.history.note")}
              />
            )}
          </View>
        }
        right={
          <View style={styles.stack}>
            {renderChanges()}
            {renderFollowers()}
          </View>
        }
      />
    );
  }

  return (
    <BottomSheet
      closeLabel={t("investment.settings.history.close")}
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={ids.modal}
      title={t("investment.settings.history.title", { index: name })}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
