import { AdaptiveLayout } from "@components";

import { useNotificationSettingsViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 124: Configurações › Notificações (types, lead days, summary time, quiet hours, families, devices).
function NotificationSettings() {
  const vm = useNotificationSettingsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default NotificationSettings;
