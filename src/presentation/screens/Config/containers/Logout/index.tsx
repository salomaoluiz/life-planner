import { router } from "expo-router";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { Button } from "@components";
import { useMutation } from "@infrastructure/fetcher";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

function Logout() {
  const { theme } = useTheme();
  const { isFetching, mutate, status } = useMutation<void, void>({
    cacheKey: [],
    fetch: useCases.logoutUseCase.execute,
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "success") {
      router.replace("/login");
    }
  }, [status]);

  function onPress() {
    mutate();
  }

  return (
    <Button.Text
      customStyles={{ textColor: theme.colors.error }}
      disabled={isFetching}
      icon={"logout"}
      label={t("configurations.logout")}
      onPress={onPress}
    />
  );
}

export default Logout;
