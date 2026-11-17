import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  Button,
  Card,
  ErrorState,
  Screen,
  StatusBanner,
  Text,
  Toast,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import { INVESTMENT_OVERVIEW_MAX_WIDTH } from "@screens/Investment/constants";
import SectionHeader from "@screens/Investment/Layout/components/SectionHeader";

import FxCards from "../components/FxCards";
import IndexCards from "../components/IndexCards";
import { InvestmentSettingsVM } from "../hooks";
import settingsTestIds from "../testIds";

// Spec 113 FR 21 (artboards "Web · Investimentos > Configurações" and "Mobile"): the stored indexes, the FX pairs
// and where the values come from. The cards wrap, so the same view serves every width.
function Wide({ vm }: AdaptiveViewProps<InvestmentSettingsVM>) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    blocks: { gap: spacing.lg, paddingBottom: spacing.xxl },
    head: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      justifyContent: "space-between",
    },
    section: { gap: spacing.xs },
    stack: { gap: spacing.sm },
  });
  const updated = t(vm.updated.key, vm.updated.params);

  function renderBody() {
    if (vm.isError) {
      return (
        <ErrorState
          message={t("investment.settings.error")}
          onRetry={vm.onRetry}
          retryLabel={t("investment.settings.retry")}
          testID={settingsTestIds.errorRetry}
        />
      );
    }

    if (vm.isLoading) {
      return (
        <View style={styles.stack}>
          <Skeleton.Card />
          <Skeleton.Card />
        </View>
      );
    }

    if (vm.isEmpty) {
      return (
        <Card testID={settingsTestIds.empty}>
          <View style={styles.stack}>
            <Text.BodyStrong value={t("investment.settings.empty.title")} />
            <Text.Caption
              tone="secondary"
              value={t("investment.settings.empty.body", { time: "19:00" })}
            />
            <Button.Primary
              label={t("investment.settings.empty.fetch")}
              loading={vm.refreshing}
              onPress={vm.onRefresh}
              testID={settingsTestIds.emptyFetch}
            />
          </View>
        </Card>
      );
    }

    return (
      <>
        {vm.notice ? (
          <StatusBanner
            icon="alert-outline"
            message={t("investment.settings.stale", { ...vm.notice })}
            testID={settingsTestIds.staleBanner}
          />
        ) : null}
        <View style={styles.section}>
          <Text.Overline value={t("investment.settings.rates")} />
          <IndexCards vm={vm} />
        </View>
        <FxCards vm={vm} />
        <Card testID={settingsTestIds.source}>
          <View style={styles.stack}>
            <Text.BodyStrong value={t("investment.settings.source.title")} />
            <Text.Caption
              tone="secondary"
              value={t("investment.settings.source.body")}
            />
          </View>
        </Card>
      </>
    );
  }

  return (
    <Screen
      maxWidth={INVESTMENT_OVERVIEW_MAX_WIDTH}
      scroll
      testID={settingsTestIds.screen}
    >
      <SectionHeader section="settings" />
      <View style={styles.blocks}>
        <View style={styles.stack}>
          <Text.Body
            tone="secondary"
            value={t("investment.settings.subtitle")}
          />
          <View style={styles.head}>
            <Text.Caption
              testID={settingsTestIds.updatedAt}
              tone="secondary"
              value={t("investment.settings.updatedAt", { when: updated })}
            />
            <Button.Secondary
              label={
                vm.refreshing
                  ? t("investment.settings.refreshing")
                  : t("investment.settings.refresh")
              }
              loading={vm.refreshing}
              onPress={vm.onRefresh}
              testID={settingsTestIds.refresh}
            />
          </View>
        </View>
        {renderBody()}
      </View>
      <Toast
        icon="clock-outline"
        message={t("investment.settings.tooMany")}
        onHide={vm.onToastHide}
        testID={settingsTestIds.tooMany}
        visible={vm.toastVisible}
      />
    </Screen>
  );
}

export default Wide;
