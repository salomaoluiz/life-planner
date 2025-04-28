import { Locale } from "expo-localization";
import React from "react";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import {
  reactI18NHooks,
  ReactI18NPProvider,
  reactI18NTranslate,
} from "@presentation/i18n/react-i18n";

import { availableLanguages } from "./translations";
import { TranslationKeys, UseTranslation, UseTranslationLocale } from "./types";

interface Props {
  children: React.ReactNode;
}

export function I18NProvider({ children }: Props) {
  return <ReactI18NPProvider>{children}</ReactI18NPProvider>;
}

export function translate(
  key: TranslationKeys,
  params?: Record<string, string>,
) {
  return reactI18NTranslate(key, params);
}

export function useTranslation(): ReturnType<UseTranslation> {
  return reactI18NHooks.useTranslation();
}

export function useTranslationLocale(): ReturnType<UseTranslationLocale> {
  const i18n = reactI18NHooks.useTranslationLocale();
  const { mutate } = useMutation({
    cacheKey: [],
    fetch: useCases.saveUserConfigsUseCase.execute,
  });

  async function changeLocale(tag: string) {
    mutate({ language: tag });
    await i18n.changeLocale(tag);
  }

  function getLocale() {
    const locale = i18n.getLocale();
    return {
      languageTag: locale.languageTag,
    } as Locale;
  }

  return {
    availableLanguages: availableLanguages,
    changeLocale,
    getLocale,
  };
}
