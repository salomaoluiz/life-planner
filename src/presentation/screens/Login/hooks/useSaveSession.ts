import { useCases } from "@application/useCases";
import { useEffect } from "react";
import { useMutation } from "@infrastructure/fetcher";
import { useUser } from "@application/providers/user";

function useLogin() {
  const { update } = useUser();

  const { mutate, status, error, isFetching } = useMutation<string, void>({
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
    isFetching,
    error,
  };
}

export default useLogin;
