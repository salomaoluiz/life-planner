import { getLocales } from "expo-localization";
import { changeLanguage } from "i18next";
import { useTranslation as useReactI18NextTranslation } from "react-i18next";

import { availableLanguages } from "@presentation/i18n/translations";
import { UseTranslationLocale } from "@presentation/i18n/types";

function useTranslationLocale(): ReturnType<UseTranslationLocale> {
  const { i18n } = useReactI18NextTranslation();

  async function changeLocale(tag: string) {
    await changeLanguage(tag);
  }

  function getLocale() {
    const locales = getLocales();
    return (
      locales.find(
        (locale) =>
          locale.languageTag === i18n.language ||
          locale.languageTag === i18n.language.split("-")[0],
      ) ?? locales[0]
    );
  }

  return {
    availableLanguages,
    changeLocale,
    getLocale,
  };
}

export default useTranslationLocale;
