import { useMutation } from "@infrastructure/fetcher";
import { useCases } from "@application/useCases";
import { addBreadcrumb } from "@infrastructure/monitoring";
import { useEffect } from "react";
import { isWeb } from "@utils/platform";
import { useUser } from "@application/providers/user";

function useLogin() {
  const { mutate, isFetching, status } = useMutation<void, void>({
    cacheKey: [useCases.loginWithGoogleUseCase.uniqueName],
    fetch: useCases.loginWithGoogleUseCase.execute,
  });

  const { update } = useUser();

  const onGoogleButtonPress = () => {
    addBreadcrumb({
      message: "User pressed the Google button",
      category: "user-action",
      level: "info",
    });
    mutate();
  };

  useEffect(() => {
    if (!isWeb() && status === "success") {
      update();
    }
  }, [status]);

  return {
    onGoogleButtonPress,
    isFetching,
  };
}

export default useLogin;
