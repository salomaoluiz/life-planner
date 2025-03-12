import i18next, { use } from "i18next";
import { useEffect } from "react";
import { initReactI18next } from "react-i18next";

import { translations } from "@presentation/i18n/translations";
import { useProviderLoader } from "@providers/loader";

function useI18NInitializer() {
  const { setIsLoading } = useProviderLoader();

  useEffect(() => {
    use(initReactI18next)
      .init({
        fallbackLng: "en-US",
        lng: i18next.language,
        resources: {
          "en-US": translations["en-US"],
          "pt-BR": translations["pt-BR"],
        },
      })
      .finally(() => {
        setIsLoading(false, "i18n");
      });
  }, []);
}

export default useI18NInitializer;
