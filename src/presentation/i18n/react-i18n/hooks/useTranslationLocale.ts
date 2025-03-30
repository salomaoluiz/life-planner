import { changeLanguage } from "i18next";
import { useTranslation as useReactI18NextTranslation } from "react-i18next";

function useTranslationLocale() {
  const { i18n } = useReactI18NextTranslation();

  async function changeLocale(tag: string) {
    await changeLanguage(tag);
  }

  function getLocale() {
    return {
      languageTag: i18n.language,
    };
  }

  return {
    changeLocale,
    getLocale,
  };
}

export default useTranslationLocale;
