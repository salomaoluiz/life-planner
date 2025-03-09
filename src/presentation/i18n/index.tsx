import {
  ReactI18NPProvider,
  reactI18NHooks,
  reactI18NTranslate,
} from "@presentation/i18n/react-i18n";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export function I18NProvider({ children }: Props) {
  return <ReactI18NPProvider>{children}</ReactI18NPProvider>;
}

export function useTranslation() {
  return reactI18NHooks.useTranslation();
}

export function useTranslationLocale() {
  return reactI18NHooks.useTranslationLocale();
}

export function translate(key: string, params?: Record<string, string>) {
  return reactI18NTranslate(key, params);
}
