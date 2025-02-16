import {
  ReactI18NPProvider,
  reactI18NHooks,
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
