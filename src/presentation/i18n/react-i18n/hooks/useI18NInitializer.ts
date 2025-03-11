import { useProviderLoader } from "@providers/loader";
import { useEffect } from "react";
import i18next, { use } from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "@presentation/i18n/translations";

function useI18NInitializer() {
  const { setIsLoading } = useProviderLoader();

  useEffect(() => {
    use(initReactI18next)
      .init({
        resources: {
          "en-US": translations["en-US"],
          "pt-BR": translations["pt-BR"],
        },
        lng: i18next.language,
        fallbackLng: "en-US",
      })
      .finally(() => {
        setIsLoading(false, "i18n");
      });
  }, []);
}

export default useI18NInitializer;
