import { View } from "react-native";

import { render, renderHook } from "@tests";

import {
  I18NProvider,
  translate,
  useTranslation,
  useTranslationLocale,
} from "@presentation/i18n";
import * as reactI18N from "@presentation/i18n/react-i18n";
import { reactI18NHooks } from "@presentation/i18n/react-i18n";
import { TranslationKeys } from "@presentation/i18n/types";

jest.mock("@presentation/i18n/react-i18n");
jest.unmock("@presentation/i18n");

const reactI18NUseTranslationSpy = jest.spyOn(reactI18NHooks, "useTranslation");
const reactI18NUseTranslationLocaleSpy = jest.spyOn(
  reactI18NHooks,
  "useTranslationLocale",
);
const reactI18NTranslateSpy = jest.spyOn(reactI18N, "reactI18NTranslate");

jest
  .spyOn(reactI18N, "ReactI18NPProvider")
  .mockImplementation(({ children }) => (
    <View testID="react-i18n-provider">{children}</View>
  ));

function setupProvider() {
  render(I18NProvider({ children: <View testID="i18n-provider-children" /> }));
}

function setupTranslate(key: TranslationKeys, params?: Record<string, string>) {
  return translate(key, params);
}

function setupUseTranslation() {
  return renderHook(() => useTranslation());
}

function setupUseTranslationLocale() {
  return renderHook(() => useTranslationLocale());
}

const setup = {
  provider: setupProvider,
  translate: setupTranslate,
  useTranslation: setupUseTranslation,
  useTranslationLocale: setupUseTranslationLocale,
};

const spies = {
  reactI18NTranslate: reactI18NTranslateSpy,
  reactI18NUseTranslation: reactI18NUseTranslationSpy,
  reactI18NUseTranslationLocale: reactI18NUseTranslationLocaleSpy,
};

export { setup, spies };
export { screen } from "@tests";
