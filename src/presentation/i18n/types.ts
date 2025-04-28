import { Locale } from "expo-localization";

import {
  availableLanguages,
  translations,
} from "@presentation/i18n/translations";

export type TranslationKeys = RecursiveKeyOf<
  (typeof translations)["en-US"]["translation"]
>;

export type UseTranslation = () => UseTranslationResponse;

export type UseTranslationLocale = () => UseTranslationLocaleResponse;
type Join<K, P> = K extends number | string
  ? P extends number | string
    ? `${K}.${P}`
    : never
  : never;

type RecursiveKeyOf<T> = {
  [K in keyof T & (number | string)]: T[K] extends object
    ? Join<K, RecursiveKeyOf<T[K]>>
    : K;
}[keyof T & (number | string)];

interface UseTranslationLocaleResponse {
  availableLanguages: typeof availableLanguages;
  changeLocale: (localeTag: string) => Promise<void>;
  getLocale: () => Locale;
}

interface UseTranslationResponse {
  t: (key: TranslationKeys, params?: Record<string, unknown>) => string;
}
