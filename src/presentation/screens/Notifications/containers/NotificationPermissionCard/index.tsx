import { View } from "react-native";

import { Button, Callout, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import notificationsTestIds from "@screens/Notifications/testIds";

import useNotificationPermissionCardViewModel from "./hooks/useNotificationPermissionCardViewModel";
import useStyles from "./styles";

// Spec 124 FR 32-34: asks for the permission in context (never at start), explains first and offers the way out
// when the system or the browser blocked it.
function NotificationPermissionCard() {
  const vm = useNotificationPermissionCardViewModel();
  const { styles } = useStyles();
  const { t } = useTranslation();

  if (vm.mode === "hidden") {
    return null;
  }

  if (vm.mode === "ios-web") {
    return (
      <Callout testID={notificationsTestIds.permissionCard} tone="warning">
        <Text.Body value={t("notifications.permission.iosWeb")} />
      </Callout>
    );
  }

  if (vm.mode === "blocked") {
    return (
      <Callout testID={notificationsTestIds.permissionCard} tone="warning">
        <View style={styles.content}>
          <Text.Body
            value={t(
              vm.canOpenSettings
                ? "notifications.permission.blocked"
                : "notifications.permission.blockedWeb",
            )}
          />
          {vm.canOpenSettings ? (
            <Button.Secondary
              label={t("notifications.permission.blocked")}
              onPress={vm.onOpenSettings}
            />
          ) : null}
        </View>
      </Callout>
    );
  }

  return (
    <Callout testID={notificationsTestIds.permissionCard} tone="warning">
      <View style={styles.content}>
        <Text.BodyStrong value={t("notifications.permission.title")} />
        <Text.Body
          value={t("notifications.permission.body", {
            count: vm.count,
            time: vm.summaryTime,
          })}
        />
        <View style={styles.actions}>
          <Button.Primary
            disabled={vm.isEnabling}
            label={t("notifications.permission.enable")}
            onPress={vm.onEnable}
            testID={notificationsTestIds.permissionEnable}
          />
          <Button.Secondary
            label={t("notifications.permission.later")}
            onPress={vm.onLater}
            testID={notificationsTestIds.permissionLater}
          />
        </View>
      </View>
    </Callout>
  );
}

export default NotificationPermissionCard;
