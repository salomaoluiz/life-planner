import { reactI18NHooks } from "./react-i18n";

function useLocaleTag(): string {
  return reactI18NHooks.useTranslationLocale().getLocale().languageTag;
}

export default useLocaleTag;
