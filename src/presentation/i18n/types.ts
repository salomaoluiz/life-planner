import { Locale } from "expo-localization";

import { availableLanguages } from "@presentation/i18n/translations";

export type UseTranslation = () => UseTranslationResponse;

export type UseTranslationLocale = () => UseTranslationLocaleResponse;

interface UseTranslationLocaleResponse {
  availableLanguages: typeof availableLanguages;
  changeLocale: (localeTag: string) => void;
  getLocale: () => Locale;
}
interface UseTranslationResponse {
  t: (key: string, params?: Record<string, unknown>) => string;
}
