import { AdaptiveLayout } from "@components";

import useNotificationsViewModel from "./hooks/useNotificationsViewModel";
import { Wide } from "./views";

// Spec 124: the notice center (summaries and urgent notices of the last 30 days, with or without push permission).
function Notifications() {
  const vm = useNotificationsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Notifications;
