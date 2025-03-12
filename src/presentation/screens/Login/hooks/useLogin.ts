import { useEffect } from "react";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import { addBreadcrumb } from "@infrastructure/monitoring";
import { isWeb } from "@utils/platform";

function useLogin() {
  const { isFetching, mutate, status } = useMutation<void, void>({
    cacheKey: [useCases.loginWithGoogleUseCase.uniqueName],
    fetch: useCases.loginWithGoogleUseCase.execute,
  });

  const { update } = useUser();

  const onGoogleButtonPress = () => {
    addBreadcrumb({
      category: "user-action",
      level: "info",
      message: "User pressed the Google button",
    });
    mutate();
  };

  useEffect(() => {
    if (!isWeb() && status === "success") {
      update();
    }
  }, [status]);

  return {
    isFetching,
    onGoogleButtonPress,
  };
}

export default useLogin;
