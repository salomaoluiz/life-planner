import { useEffect } from "react";

import { useUser } from "@application/providers/user";
import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";

function useSaveSession() {
  const { update } = useUser();

  const { error, isFetching, mutate, status } = useMutation<string, void>({
    cacheKey: [useCases.saveWebSessionUseCase.uniqueName],
    fetch: useCases.saveWebSessionUseCase.execute,
  });

  useEffect(() => {
    const hash = window.location.hash;
    mutate(hash);
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

export default useSaveSession;
