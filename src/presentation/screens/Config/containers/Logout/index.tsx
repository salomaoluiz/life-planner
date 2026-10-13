import { router } from "expo-router";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { Button } from "@components";
import { clearSessionExpiredNotice } from "@infrastructure/api";
import { resetFetcherData, useMutation } from "@infrastructure/fetcher";
import { useTranslation } from "@presentation/i18n";

function Logout() {
  const { isFetching, mutate, status } = useMutation<void, void>({
    cacheKey: [],
    fetch: useCases.logoutUseCase.execute,
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "success") {
      // A manual logout must never leave the "session expired" notice behind.
      clearSessionExpiredNotice();
      router.replace("/login");
      // Drop the cached user so going back does not reveal app screens.
      void resetFetcherData();
    }
  }, [status]);

  function onPress() {
    mutate();
  }

  return (
    <Button.Ghost
      disabled={isFetching}
      icon={"logout"}
      inline
      label={t("configurations.logout")}
      onPress={onPress}
      tone={"expense"}
    />
  );
}

export default Logout;
