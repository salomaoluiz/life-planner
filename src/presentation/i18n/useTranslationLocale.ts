import { Locale } from "expo-localization";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";

import { reactI18NHooks } from "./react-i18n";
import { availableLanguages } from "./translations";
import { UseTranslationLocale } from "./types";

function useTranslationLocale(): ReturnType<UseTranslationLocale> {
  const i18n = reactI18NHooks.useTranslationLocale();
  const { mutate } = useMutation({
    cacheKey: [useCases.saveUserConfigsUseCase.uniqueName],
    fetch: useCases.saveUserConfigsUseCase.execute,
  });

  async function changeLocale(tag: string) {
    mutate({ language: tag });
    await i18n.changeLocale(tag);
  }

  function getLocale() {
    const locale = i18n.getLocale();
    return {
      languageTag: locale.languageTag,
    } as Locale;
  }

  return {
    availableLanguages: availableLanguages,
    changeLocale,
    getLocale,
  };
}

export default useTranslationLocale;
