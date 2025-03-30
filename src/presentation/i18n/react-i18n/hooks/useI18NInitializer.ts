import i18next, { use } from "i18next";
import { useEffect } from "react";
import { initReactI18next } from "react-i18next";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import { translations } from "@presentation/i18n/translations";
import { useProviderLoader } from "@providers/loader";

function useI18NInitializer() {
  const { setIsLoading } = useProviderLoader();
  const { data, status } = useQuery({
    cacheKey: [],
    fetch: useCases.getUserConfigsUseCase.execute,
  });

  async function initialize() {
    use(initReactI18next)
      .init({
        fallbackLng: "en-US",
        lng: data?.language ?? i18next.language,
        resources: {
          "en-US": translations["en-US"],
          "pt-BR": translations["pt-BR"],
        },
      })
      .finally(() => {
        setIsLoading(false, "i18n");
      });
  }

  useEffect(() => {
    if (status === "success") {
      initialize();
    }
  }, [status]);
}

export default useI18NInitializer;
