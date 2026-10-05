import { router } from "expo-router";

import { useTranslation } from "@presentation/i18n";
import { SETTINGS_PATH } from "@screens/Navigation/models/navigationItems";

function useProfileButtonViewModel() {
  const { t } = useTranslation();

  function onPress() {
    router.push(SETTINGS_PATH as never);
  }

  return { label: t("navigation.profileAndSettings"), onPress };
}

export default useProfileButtonViewModel;
