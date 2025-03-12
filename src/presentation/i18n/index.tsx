import React from "react";

import {
  reactI18NHooks,
  ReactI18NPProvider,
  reactI18NTranslate,
} from "@presentation/i18n/react-i18n";

interface Props {
  children: React.ReactNode;
}

export function I18NProvider({ children }: Props) {
  return <ReactI18NPProvider>{children}</ReactI18NPProvider>;
}

export function translate(key: string, params?: Record<string, string>) {
  return reactI18NTranslate(key, params);
}

export function useTranslation() {
  return reactI18NHooks.useTranslation();
}

export function useTranslationLocale() {
  return reactI18NHooks.useTranslationLocale();
}
