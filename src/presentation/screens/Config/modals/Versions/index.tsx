import { View } from "react-native";

import { Badge, BottomSheet, Button, IconButton, Text } from "@components";
import { environmentKey } from "@presentation/hooks/useVersionInfo/labels";
import { useTranslation } from "@presentation/i18n";
import { useBreakpoint, useTheme } from "@presentation/theme";

import { ChangesList, VersionCard } from "./components";
import { useVersionsViewModel } from "./hooks";
import versionsTestIds from "./testIds";

function VersionsModal() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const wide = useBreakpoint() !== "compact";
  const vm = useVersionsViewModel();
  const { spacing } = theme.sizes;
  const { changes } = vm;

  let title = t("versions.title");
  if (changes) {
    title =
      changes.service === "api"
        ? t("versions.changes.titleApi")
        : t("versions.changes.titleApp");
  }

  const footer = changes ? (
    <Button.Primary
      fullWidth
      label={t("versions.action.back")}
      onPress={vm.onBack}
      size="lg"
      testID={versionsTestIds.backButton}
    />
  ) : (
    <Button.Primary
      fullWidth
      label={t("versions.action.close")}
      onPress={vm.onClose}
      size="lg"
      testID={versionsTestIds.closeButton}
    />
  );
  let secondary = (
    <Button.Secondary
      fullWidth
      label={t("versions.action.checkNow")}
      loading={vm.isChecking}
      onPress={vm.onCheckNow}
      size="lg"
      testID={versionsTestIds.checkNowButton}
    />
  );
  if (changes) {
    const { latestUrl } = changes;
    secondary = (
      <Button.Secondary
        disabled={!latestUrl}
        fullWidth
        icon="open-in-new"
        label={t("versions.changes.openGithub")}
        onPress={() => latestUrl && vm.onOpenGithub(latestUrl)}
        size="lg"
        testID={versionsTestIds.githubButton}
      />
    );
  }

  return (
    <BottomSheet
      closeLabel={t("versions.action.close")}
      footer={footer}
      footerSecondary={secondary}
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={versionsTestIds.sheet}
      title={title}
      visible
    >
      {changes ? (
        <View style={{ gap: spacing.md }}>
          <View style={{ alignItems: "flex-start" }}>
            <IconButton
              accessibilityLabel={t("versions.action.back")}
              name="arrow-left"
              onPress={vm.onBack}
              testID={`${versionsTestIds.backButton}.arrow`}
            />
          </View>
          <ChangesList changes={changes} />
        </View>
      ) : (
        <View style={{ gap: spacing.lg }}>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            {vm.environment ? (
              <Badge
                label={t(environmentKey(vm.environment))}
                tone={vm.environment === "STAGING" ? "warning" : "accent"}
              />
            ) : null}
            <Text.Caption
              tone="secondary"
              value={
                vm.checked
                  ? t("versions.checkedAgo", {
                      time: t(vm.checked.key, { count: vm.checked.count }),
                    })
                  : t("versions.checkedNever")
              }
            />
          </View>
          <View
            style={{ flexDirection: wide ? "row" : "column", gap: spacing.lg }}
          >
            {vm.cards.map((card) => (
              <VersionCard
                card={card}
                key={card.service}
                onAction={() => vm.onAction(card.service)}
                onWhatChanged={() => vm.onWhatChanged(card.service)}
              />
            ))}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

export default VersionsModal;
