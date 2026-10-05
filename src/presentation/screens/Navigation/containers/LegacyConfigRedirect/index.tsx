import { Redirect } from "expo-router";

import { SETTINGS_PATH } from "@screens/Navigation/models/navigationItems";

// Bookmarked web URL `/config` (old Configurations tab) now lives at `/settings`.
function LegacyConfigRedirect() {
  return <Redirect href={SETTINGS_PATH as never} />;
}

export default LegacyConfigRedirect;
