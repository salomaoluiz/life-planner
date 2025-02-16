import { UseTranslationLocale } from "@presentation/i18n/types";
import { useTranslation as useReactI18NextTranslation } from "react-i18next";
import { changeLanguage } from "i18next";
import { getLocales } from "expo-localization";
import { availableLanguages } from "@presentation/i18n/translations";

function useTranslationLocale(): ReturnType<UseTranslationLocale> {
  const { i18n } = useReactI18NextTranslation();

  const changeLocale = async (tag: string) => {
    await changeLanguage(tag);
  };

  const getLocale = () => {
    const locales = getLocales();
    return (
      locales.find(
        (locale) =>
          locale.languageTag === i18n.language ||
          locale.languageTag === i18n.language.split("-")[0],
      ) || locales[0]
    );
  };

  return {
    availableLanguages,
    changeLocale,
    getLocale,
  };
}

export default useTranslationLocale;
