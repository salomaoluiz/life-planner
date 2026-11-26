import { router } from "expo-router";

import { Button } from "@components";
import { useTranslation } from "@presentation/i18n";

// Spec 124: the entry of Configurações › Notificações.
function NotificationsLink() {
  const { t } = useTranslation();

  return (
    <Button.Secondary
      icon="bell-outline"
      label={t("notifications.settings.title")}
      onPress={() => router.push("/notification-settings" as never)}
      testID="settings-notifications-link"
    />
  );
}

export default NotificationsLink;
