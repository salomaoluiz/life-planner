import { availableLanguages } from "@presentation/i18n/translations";
import { Locale } from "expo-localization";

interface UseTranslationResponse {
  t: (key: string, params?: Record<string, unknown>) => string;
}

interface UseTranslationLocaleResponse {
  changeLocale: (localeTag: string) => void;
  getLocale: () => Locale;
  availableLanguages: typeof availableLanguages;
}

export type UseTranslation = () => UseTranslationResponse;
export type UseTranslationLocale = () => UseTranslationLocaleResponse;
