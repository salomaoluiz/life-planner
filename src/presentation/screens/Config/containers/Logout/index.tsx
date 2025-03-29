import { router } from "expo-router";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { Button } from "@components";
import { useMutation } from "@infrastructure/fetcher";
import { useTheme } from "@presentation/theme";

function Logout() {
  const { theme } = useTheme();
  const { isFetching, mutate, status } = useMutation<void, void>({
    cacheKey: [],
    fetch: useCases.logoutUseCase.execute,
  });

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
      label={"Logout"}
      onPress={onPress}
    />
  );
}

export default Logout;
