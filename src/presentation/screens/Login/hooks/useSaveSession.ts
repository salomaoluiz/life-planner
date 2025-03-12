import { useEffect } from "react";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";

function useLogin() {
  const { update } = useUser();

  const { error, isFetching, mutate, status } = useMutation<string, void>({
    cacheKey: [useCases.saveWebSessionUseCase.uniqueName],
    fetch: useCases.saveWebSessionUseCase.execute,
  });

  useEffect(() => {
    mutate(window.location.hash);
  }, [window.location.hash]);

  useEffect(() => {
    if (status === "success") {
      update();
    }
  }, [status]);

  return {
    error,
    isFetching,
  };
}

export default useLogin;
